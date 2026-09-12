const patterns = [
  {
    name: "Urgency",
    points: 15,
    severity: "Medium",
    regex: /\b(urgent|immediately|right now|today|within \d+ hours?|act now|last chance|hurry)\b/i,
    explanation: "The message creates pressure to act quickly instead of giving the recipient time to verify the request.",
  },
  {
    name: "Payment Request",
    points: 20,
    severity: "High",
    regex: /\b(pay|payment|processing fee|registration fee|transfer|send money|deposit|refund fee|service fee|rs\.?)\b|₹/i,
    explanation: "The message asks for money, a fee, or a financial transfer.",
  },
  {
    name: "Credential Request",
    points: 25,
    severity: "Critical",
    regex: /\b(otp|one[- ]time password|upi pin|pin|password|cvv|card number|verification code|security code)\b/i,
    explanation: "The message asks for sensitive credentials or verification information that should never be shared with an unverified sender.",
  },
  {
    name: "Reward Bait",
    points: 15,
    severity: "Medium",
    regex: /\b(cashback|reward|prize|winner|bonus|lottery|gift|free money|congratulations)\b/i,
    explanation: "The message uses a reward or prize to encourage the recipient to interact.",
  },
  {
    name: "Threat",
    points: 15,
    severity: "High",
    regex: /\b(blocked|suspended|deactivated|legal action|penalty|arrest|account will be closed|police complaint)\b/i,
    explanation: "The message uses fear, penalties, or account consequences to pressure the recipient.",
  },
  {
    name: "Bank/KYC Impersonation",
    points: 15,
    severity: "High",
    regex: /\b(bank|banking|kyc|rbi|account|credit card|debit card|upi)\b/i,
    explanation: "The message references a financial institution, banking service, or KYC process that may be impersonated by scammers.",
  },
  {
    name: "Suspicious Link",
    points: 25,
    severity: "High",
    regex: /(https?:\/\/|www\.)\S+/i,
    explanation: "The message contains a link that should be independently verified before opening.",
  },
  {
    name: "Login/Verification Request",
    points: 20,
    severity: "High",
    regex: /\b(login|log in|verify your account|verify identity|confirm account|update details|unlock account|sign in)\b/i,
    explanation: "The message asks the recipient to log in, verify, or update an account through the message.",
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

  if (/\b(kyc|bank|banking|rbi|credit card|debit card)\b/.test(text)) {
    return "Bank / KYC Scam";
  }

  if (/\b(upi|payment|pay|transfer|send money)\b/.test(text)) {
    return "UPI / Payment Scam";
  }

  if (/\b(job|salary|registration fee|work from home|vacancy)\b/.test(text)) {
    return "Job Scam";
  }

  if (/\b(cashback|reward|prize|winner|lottery|bonus|gift)\b/.test(text)) {
    return "Reward / Cashback Scam";
  }

  if (/\b(investment|crypto|trading|double your money|guaranteed return)\b/.test(text)) {
    return "Investment Scam";
  }

  if (/\b(delivery|courier|parcel|package)\b/.test(text)) {
    return "Delivery Scam";
  }

  if (/\b(loan|instant loan|credit approval)\b/.test(text)) {
    return "Loan Scam";
  }

  if (/\b(login|password|otp|verify account|unlock account|sign in)\b/.test(text)) {
    return "Account Takeover Scam";
  }

  return "Suspicious Communication";
}

function extractUrls(message) {
  const urlRegex = /(https?:\/\/|www\.)\S+/gi;
  return [...new Set(message.match(urlRegex) || [])].map((url) =>
    url.replace(/[),.!?;:'\"]+$/g, "")
  );
}

function analyzeUrls(message) {
  const urls = extractUrls(message);
  const indicators = [];
  let risk = 0;

  for (const url of urls) {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.startsWith("http://")) {
      indicators.push({
        name: "Unencrypted HTTP link",
        points: 15,
        explanation: "The link does not use HTTPS encryption.",
      });
      risk += 15;
    }

    if (/https?:\/\/\d{1,3}(\.\d{1,3}){3}/i.test(url)) {
      indicators.push({
        name: "IP-address URL",
        points: 20,
        explanation: "The link uses a raw IP address instead of a normal domain name.",
      });
      risk += 20;
    }

    if (/\b(bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|rb\.gy)\b/i.test(url)) {
      indicators.push({
        name: "URL shortener",
        points: 15,
        explanation: "The destination is hidden behind a URL-shortening service.",
      });
      risk += 15;
    }

    if (url.length > 100) {
      indicators.push({
        name: "Unusually long URL",
        points: 10,
        explanation: "The URL is unusually long and may contain tracking or obfuscated parameters.",
      });
      risk += 10;
    }

    if (/login|verify|secure|update|kyc|account|wallet|payment|refund|bonus/i.test(lowerUrl)) {
      indicators.push({
        name: "Sensitive-action keywords in URL",
        points: 15,
        explanation: "The URL contains keywords commonly associated with account or payment actions.",
      });
      risk += 15;
    }

    const dotCount = (url.match(/\./g) || []).length;
    if (dotCount >= 4) {
      indicators.push({
        name: "Excessive subdomains",
        points: 10,
        explanation: "The URL contains an unusually large number of domain levels.",
      });
      risk += 10;
    }

    if (/@/.test(url)) {
      indicators.push({
        name: "URL user-info marker",
        points: 20,
        explanation: "The URL contains an @ symbol, which can be used to make a destination look misleading.",
      });
      risk += 20;
    }
  }

  return {
    found: urls.length > 0,
    count: urls.length,
    urls,
    indicators,
    risk: Math.min(risk, 50),
  };
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

function getProtectionActions(riskLevel, category) {
  const actions = [
    "Do not click unexpected links.",
    "Verify the sender using an official app, website, or known phone number.",
  ];

  if (["High", "Critical"].includes(riskLevel)) {
    actions.push("Do not share OTPs, PINs, passwords, CVV, or verification codes.");
    actions.push("Do not send money or pay a fee because of this message.");
  }

  if (category === "Bank / KYC Scam" || category === "UPI / Payment Scam") {
    actions.push("Open your bank or UPI app directly instead of using the message link.");
  }

  return actions;
}

function getRiskSummary(signals, urlAnalysis, score) {
  const totalSignals = signals.length + urlAnalysis.indicators.length;

  if (totalSignals === 0) {
    return "No major measurable scam indicators were detected in this message.";
  }

  const strongestSignal = [...signals, ...urlAnalysis.indicators].sort(
    (a, b) => b.points - a.points
  )[0];

  return `Detected ${totalSignals} measurable warning signal(s). The strongest indicator is ${strongestSignal.name} (+${strongestSignal.points}). Evidence contributed to a risk score of ${score}/100.`;
}

export function analyzeMessage(message) {
  const signals = [];
  let score = 0;

  for (const pattern of patterns) {
    if (pattern.regex.test(message)) {
      signals.push({
        name: pattern.name,
        points: pattern.points,
        severity: pattern.severity,
        explanation: pattern.explanation,
      });
      score += pattern.points;
    }
  }

  const urlAnalysis = analyzeUrls(message);
  score = Math.min(score + urlAnalysis.risk, 100);

  const riskLevel = calculateRiskLevel(score);
  const category = detectCategory(message);
  const recommendation = getRecommendation(riskLevel);
  const protectionActions = getProtectionActions(riskLevel, category);
  const riskSummary = getRiskSummary(signals, urlAnalysis, score);

  return {
    riskScore: score,
    riskLevel,
    category,
    signals,
    evidence: {
      textSignals: signals.length,
      urlIndicators: urlAnalysis.indicators.length,
      totalSignals: signals.length + urlAnalysis.indicators.length,
    },
    urlAnalysis,
    riskSummary,
    recommendation,
    protectionActions,
  };
}
