import dns from "dns";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import scanRoutes from "./routes/scanRoutes.js";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = Number(process.env.PORT) || 5000;

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
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, true);
    },
  })
);

app.use(express.json({ limit: "1mb" }));

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

// Primary scan API route.
app.use("/api/scan", scanRoutes);

// Backward-compatible alias. Some frontend builds may still call /api/scans.
app.use("/api/scans", scanRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("API error:", err.message);
  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

const connectMongoDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from environment variables");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
  });

  console.log("MongoDB connected successfully");
};

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);

  connectMongoDB().catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    console.error("Check MONGO_URI, Atlas Network Access, and environment variables.");
  });
});
