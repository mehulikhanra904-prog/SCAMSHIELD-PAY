const patterns = [
  {
    name: "Urgency",
    points: 15,
    regex: /\b(urgent|immediately|right now|today|within \d+ hours?|act now|last chance)\b/i,
    explanation: "The message creates pressure to act quickly.",
  },

  {
    name: "Payment Request",
    points: 20,
    regex: /\b(pay|payment|processing fee|registration fee|transfer|send money|deposit|₹|\brs\.?\b)\b/i,
    explanation: "The message asks for money or a financial payment.",
  },

  {
    name: "Credential Request",
    points: 25,
    regex: /\b(otp|one[- ]time password|upi pin|pin|password|cvv|card number|verification code)\b/i,
    explanation: "The message asks for sensitive credentials or verification information.",
  },

  {
    name: "Reward Bait",
    points: 15,
    regex: /\b(cashback|reward|prize|winner|bonus|lottery|gift|free money)\b/i,
    explanation: "The message uses a reward or prize to encourage action.",
  },

  {
    name: "Threat",
    points: 15,
    regex: /\b(blocked|suspended|deactivated|legal action|penalty|arrest|account will be closed)\b/i,
    explanation: "The message uses threats or negative consequences to create fear.",
  },

  {
    name: "Bank/KYC Impersonation",
    points: 15,
    regex: /\b(bank|banking|kyc|rbi|account|credit card|debit card|upi)\b/i,
    explanation: "The message appears to imitate a financial institution or banking service.",
  },

  {
    name: "Suspicious Link",
    points: 25,
    regex: /(https?:\/\/|www\.)\S+/i,
    explanation: "The message contains a link that should be verified before opening.",
  },
];

function calculateRiskLevel(score) {
  if (score <= 25) return "Low";
  if (score <= 50) return "Moderate";
  if (score <= 75) return "High";
  return "Critical";
}

function detectCategory(message) {
  const text = message.toLowerCase();

  if (
    text.includes("kyc") ||
    text.includes("bank") ||
    text.includes("account")
  ) {
    return "Bank / KYC Scam";
  }

  if (
    text.includes("upi") ||
    text.includes("payment") ||
    text.includes("pay")
  ) {
    return "UPI / Payment Scam";
  }

  if (
    text.includes("job") ||
    text.includes("salary") ||
    text.includes("registration fee")
  ) {
    return "Job Scam";
  }

  if (
    text.includes("cashback") ||
    text.includes("reward") ||
    text.includes("prize")
  ) {
    return "Reward / Cashback Scam";
  }

  return "Suspicious Communication";
}

function getRecommendation(riskLevel) {
  switch (riskLevel) {
    case "Critical":
      return "Do not click links, send money, or share OTP/PIN/passwords. Verify the sender through an official channel.";

    case "High":
      return "Avoid interacting with the message. Do not share sensitive information or make payments until the sender is independently verified.";

    case "Moderate":
      return "Be cautious. Verify the sender and the request using an official website or known contact number.";

    default:
      return "No major scam indicators were detected, but always verify unexpected messages before taking action.";
  }
}

export function analyzeMessage(message) {
  const signals = [];
  let score = 0;

  for (const pattern of patterns) {
    if (pattern.regex.test(message)) {
      signals.push({
        name: pattern.name,
        points: pattern.points,
        explanation: pattern.explanation,
      });

      score += pattern.points;
    }
  }

  score = Math.min(score, 100);

  const riskLevel = calculateRiskLevel(score);
  const category = detectCategory(message);
  const recommendation = getRecommendation(riskLevel);

  return {
    riskScore: score,
    riskLevel,
    category,
    signals,
    recommendation,
  };
}