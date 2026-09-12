import mongoose from "mongoose";
import Scan from "../models/Scan.js";
import { analyzeMessage } from "../services/scamEngine.js";

export const analyzeScan = async (req, res) => {
  try {
    const { message } = req.body ?? {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a message to analyze.",
      });
    }

    const cleanedMessage = message.trim();

    if (cleanedMessage.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    if (cleanedMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters.",
      });
    }

    // The actual scam analysis does not require MongoDB.
    const analysis = analyzeMessage(cleanedMessage);

    // Save the scan when MongoDB is available.
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Scam analysis is ready, but MongoDB is not connected yet.",
        database: "disconnected",
      });
    }

    const scan = await Scan.create({
      message: cleanedMessage,
      ...analysis,
    });

    return res.status(200).json({
      success: true,
      data: scan,
    });
  } catch (error) {
    console.error("Scan analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to analyze the message.",
    });
  }
};
