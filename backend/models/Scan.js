import mongoose from "mongoose";

const signalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    points: { type: Number, required: true },
    severity: { type: String, enum: ["Low", "Medium", "High", "Critical"] },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const urlIndicatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    points: { type: Number, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const campaignAnalysisSchema = new mongoose.Schema(
  {
    detected: { type: Boolean, default: false },
    campaignId: { type: String, default: "" },
    label: { type: String, default: "" },
    confidence: { type: Number, default: 0, min: 0, max: 100 },
    matchedTactics: { type: [String], default: [] },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const scanSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ["Low", "Moderate", "High", "Critical"],
    },
    category: {
      type: String,
      required: true,
    },
    signals: {
      type: [signalSchema],
      default: [],
    },
    evidence: {
      textSignals: { type: Number, default: 0 },
      urlIndicators: { type: Number, default: 0 },
      totalSignals: { type: Number, default: 0 },
    },
    urlAnalysis: {
      found: { type: Boolean, default: false },
      count: { type: Number, default: 0 },
      urls: { type: [String], default: [] },
      indicators: { type: [urlIndicatorSchema], default: [] },
      risk: { type: Number, default: 0, min: 0, max: 50 },
    },
    campaignAnalysis: {
      type: campaignAnalysisSchema,
      default: () => ({
        detected: false,
        campaignId: "",
        label: "",
        confidence: 0,
        matchedTactics: [],
        explanation: "",
      }),
    },
    riskSummary: {
      type: String,
      required: true,
    },
    recommendation: {
      type: String,
      required: true,
    },
    protectionActions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Scan = mongoose.model("Scan", scanSchema);

export default Scan;
