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
    const campaignId = analysis.campaignAnalysis?.campaignId || "";
    let previousMatches = 0;

    // MongoDB is used for history and campaign aggregation, but it should not
    // prevent the core scam analysis from working when the database is waking
    // up, temporarily unavailable, or not configured in a local demo.
    if (mongoose.connection.readyState === 1) {
      if (campaignId) {
        previousMatches = await Scan.countDocuments({ "campaignAnalysis.campaignId": campaignId });
      }

      const threatIntelligence = buildThreatIntelligence(analysis, previousMatches);
      const scan = await Scan.create({
        message: cleanedMessage,
        ...analysis,
        threatIntelligence,
      });

      return res.status(200).json({ success: true, data: scan, database: "connected" });
    }

    const threatIntelligence = buildThreatIntelligence(analysis, 0);
    return res.status(200).json({
      success: true,
      data: {
        message: cleanedMessage,
        ...analysis,
        threatIntelligence,
      },
      database: "disconnected",
      warning: "Analysis completed, but this scan was not saved because MongoDB is not connected.",
    });
  } catch (error) {
    console.error("Scan analysis error:", error);
    return res.status(500).json({ success: false, message: "Unable to analyze the message." });
  }
};
