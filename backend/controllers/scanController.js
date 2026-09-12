import mongoose from "mongoose";
import Scan from "../models/Scan.js";
import { analyzeMessage } from "../services/scamEngine.js";
import { buildThreatIntelligence } from "../services/threatIntelligence.js";

export const analyzeScan = async (req, res) => {
  try {
    const { message } = req.body ?? {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, message: "Please provide a message to analyze." });
    }

    const cleanedMessage = message.trim();
    if (!cleanedMessage) return res.status(400).json({ success: false, message: "Message cannot be empty." });
    if (cleanedMessage.length > 5000) return res.status(400).json({ success: false, message: "Message cannot exceed 5000 characters." });

    const analysis = analyzeMessage(cleanedMessage);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: "Scam analysis is ready, but MongoDB is not connected yet.", database: "disconnected" });
    }

    const campaignId = analysis.campaignAnalysis?.campaignId || "";
    let previousMatches = 0;

    if (campaignId) {
      previousMatches = await Scan.countDocuments({ "campaignAnalysis.campaignId": campaignId });
    }

    const threatIntelligence = buildThreatIntelligence(analysis, previousMatches);

    const scan = await Scan.create({
      message: cleanedMessage,
      ...analysis,
      threatIntelligence,
    });

    return res.status(200).json({ success: true, data: scan });
  } catch (error) {
    console.error("Scan analysis error:", error);
    return res.status(500).json({ success: false, message: "Unable to analyze the message." });
  }
};
