import mongoose from "mongoose";

const signalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    points: {
      type: Number,
      required: true,
    },

    explanation: {
      type: String,
      required: true,
    },
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

    recommendation: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Scan = mongoose.model("Scan", scanSchema);

export default Scan;