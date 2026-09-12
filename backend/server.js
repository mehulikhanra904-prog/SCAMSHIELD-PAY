import dns from "dns";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import scanRoutes from "./routes/scanRoutes.js";

// Load environment variables
dotenv.config();

// Use public DNS servers instead of the local router DNS
dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "ScamShield Pay API is running",
  });
});

// Scan routes
app.use("/api/scan", scanRoutes);

// Start server after MongoDB connection
const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:");
    console.error(error.message);

    process.exit(1);
  }
};

startServer();