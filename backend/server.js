import dns from "dns";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import scanRoutes from "./routes/scanRoutes.js";

// Load environment variables before using them.
dotenv.config();

// Atlas uses SRV DNS records. These public resolvers help when the
// local/router DNS resolver cannot resolve mongodb+srv addresses.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no Origin header (curl/Postman/server-to-server).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // During development, don't block the API because of a stale frontend URL.
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
  })
);

app.use(express.json({ limit: "1mb" }));

// Health check — this endpoint must work even while MongoDB is connecting.
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "ScamShield Pay API is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    server: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Scan routes
app.use("/api/scan", scanRoutes);

// Express JSON / route errors
app.use((err, req, res, next) => {
  console.error("API error:", err.message);

  if (err.message === "CORS origin not allowed") {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

const connectMongoDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
  });

  console.log("MongoDB connected successfully");
};

// Start HTTP server first so /api and /api/health remain available even
// if MongoDB temporarily has a DNS/network problem.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  connectMongoDB().catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    console.error("Check MONGO_URI, Atlas Network Access, and internet/DNS connectivity.");
  });
});
