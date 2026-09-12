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

const knownOrganizations = [
  { name: "State Bank of India", aliases: ["sbi", "state bank of india"], domains: ["sbi.co.in", "onlinesbi.sbi"] },
  { name: "HDFC Bank", aliases: ["hdfc", "hdfc bank"], domains: ["hdfcbank.com"] },
  { name: "ICICI Bank", aliases: ["icici", "icici bank"], domains: ["icicibank.com"] },
  { name: "Axis Bank", aliases: ["axis", "axis bank"], domains: ["axisbank.com"] },
  { name: "Punjab National Bank", aliases: ["pnb", "punjab national bank"], domains: ["pnbindia.in"] },
  { name: "RBI", aliases: ["rbi", "reserve bank of india"], domains: ["rbi.org.in"] },
  { name: "Google", aliases: ["google"], domains: ["google.com"] },
  { name: "Microsoft", aliases: ["microsoft"], domains: ["microsoft.com"] },
  { name: "Amazon", aliases: ["amazon"], domains: ["amazon.in", "amazon.com"] },
  { name: "Flipkart", aliases: ["flipkart"], domains: ["flipkart.com"] },
  { name: "Paytm", aliases: ["paytm"], domains: ["paytm.com"] },
  { name: "PhonePe", aliases: ["phonepe"], domains: ["phonepe.com"] },
  { name: "Google Pay", aliases: ["google pay", "gpay"], domains: ["google.com"] },
];

function calculateRiskLevel(score) {
  if (score <= 25) return "Low";
  if (score <= 50) return "Moderate";
  if (score <= 75) return "High";
  return "Critical";
}

function detectCategory(message) {
  const text = message.toLowerCase();

  if (/\b(kyc|bank|banking|rbi|credit card|debit card)\b/.test(text)) return "Bank / KYC Scam";
  if (/\b(upi|payment|pay|transfer|send money)\b/.test(text)) return "UPI / Payment Scam";
  if (/\b(job|salary|registration fee|work from home|vacancy)\b/.test(text)) return "Job Scam";
  if (/\b(cashback|reward|prize|winner|lottery|bonus|gift)\b/.test(text)) return "Reward / Cashback Scam";
  if (/\b(investment|crypto|trading|double your money|guaranteed return)\b/.test(text)) return "Investment Scam";
  if (/\b(delivery|courier|parcel|package)\b/.test(text)) return "Delivery Scam";
  if (/\b(loan|instant loan|credit approval)\b/.test(text)) return "Loan Scam";
  if (/\b(login|password|otp|verify account|unlock account|sign in)\b/.test(text)) return "Account Takeover Scam";

  return "Suspicious Communication";
}

function extractUrls(message) {
  const urlRegex = /(https?:\/\/|www\.)\S+/gi;
  return [...new Set(message.match(urlRegex) || [])].map((url) =>
    url.replace(/[),.!?;:'\"]+$/g, "")
  );
}

function addUrlIndicator(indicators, indicator) {
  if (!indicators.some((item) => item.name === indicator.name)) {
    indicators.push(indicator);
    return indicator.points;
  }
  return 0;
}

function analyzeUrls(message) {
  const urls = extractUrls(message);
  const indicators = [];
  let risk = 0;

  for (const url of urls) {
    const lowerUrl = url.toLowerCase();
    let parsedUrl = null;

    try {
      parsedUrl = new URL(url.startsWith("www.") ? `https://${url}` : url);
    } catch {
      risk += addUrlIndicator(indicators, {
        name: "Malformed URL",
        points: 15,
        explanation: "The link could not be parsed as a normal web URL and should be treated cautiously.",
      });
    }

    if (lowerUrl.startsWith("http://")) {
      risk += addUrlIndicator(indicators, {
        name: "Unencrypted HTTP link",
        points: 15,
        explanation: "The link does not use HTTPS encryption.",
      });
    }

    if (/https?:\/\/\d{1,3}(\.\d{1,3}){3}/i.test(url)) {
      risk += addUrlIndicator(indicators, {
        name: "IP-address URL",
        points: 20,
        explanation: "The link uses a raw IP address instead of a normal domain name.",
      });
    }

    if (/\b(bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|rb\.gy)\b/i.test(url)) {
      risk += addUrlIndicator(indicators, {
        name: "URL shortener",
        points: 15,
        explanation: "The destination is hidden behind a URL-shortening service.",
      });
    }

    if (url.length > 100) {
      risk += addUrlIndicator(indicators, {
        name: "Unusually long URL",
        points: 10,
        explanation: "The URL is unusually long and may contain tracking or obfuscated parameters.",
      });
    }

    if (/login|verify|secure|update|kyc|account|wallet|payment|refund|bonus/i.test(lowerUrl)) {
      risk += addUrlIndicator(indicators, {
        name: "Sensitive-action keywords in URL",
        points: 15,
        explanation: "The URL contains keywords commonly associated with account or payment actions.",
      });
    }

    const dotCount = (url.match(/\./g) || []).length;
    if (dotCount >= 4) {
      risk += addUrlIndicator(indicators, {
        name: "Excessive subdomains",
        points: 10,
        explanation: "The URL contains an unusually large number of domain levels.",
      });
    }

    if (/@/.test(url)) {
      risk += addUrlIndicator(indicators, {
        name: "URL user-info marker",
        points: 20,
        explanation: "The URL contains an @ symbol, which can be used to make a destination look misleading.",
      });
    }

    if (parsedUrl) {
      const hostname = parsedUrl.hostname.toLowerCase();

      if (hostname.includes("xn--")) {
        risk += addUrlIndicator(indicators, {
          name: "Punycode domain",
          points: 20,
          explanation: "The domain uses punycode, which can be used in look-alike or homograph domains.",
        });
      }

      if (/%[0-9a-f]{2}/i.test(parsedUrl.pathname + parsedUrl.search)) {
        risk += addUrlIndicator(indicators, {
          name: "Encoded URL content",
          points: 10,
          explanation: "The URL contains percent-encoded content that can hide the visible structure of a destination.",
        });
      }

      if (/\.{2,}|\/\/(?!$)/.test(parsedUrl.pathname)) {
        risk += addUrlIndicator(indicators, {
          name: "Unusual URL path structure",
          points: 10,
          explanation: "The URL path contains unusual repeated separators that may indicate obfuscation or redirect tricks.",
        });
      }

      if (/[?&](redirect|url|next|return|continue|dest|destination)=/i.test(parsedUrl.search)) {
        risk += addUrlIndicator(indicators, {
          name: "Redirect parameter",
          points: 15,
          explanation: "The URL contains a parameter commonly used to redirect visitors to another destination.",
        });
      }

      const suspiciousTlds = [".zip", ".mov", ".click", ".top", ".xyz", ".shop", ".buzz"];
      if (suspiciousTlds.some((tld) => hostname.endsWith(tld))) {
        risk += addUrlIndicator(indicators, {
          name: "Higher-risk domain ending",
          points: 10,
          explanation: "The domain uses a TLD frequently seen in disposable, promotional, or abuse-prone domains. This is a warning signal, not proof of fraud.",
        });
      }

      if (hostname.split(".").some((label) => label.length > 30)) {
        risk += addUrlIndicator(indicators, {
          name: "Abnormally long domain label",
          points: 10,
          explanation: "One part of the hostname is unusually long and may be used to disguise the destination.",
        });
      }
    }
  }

  return {
    found: urls.length > 0,
    count: urls.length,
    urls,
    indicators,
    risk: Math.min(risk, 60),
  };
}

function getBaseDomain(hostname) {
  const clean = hostname.toLowerCase().replace(/^www\./, "");
  const parts = clean.split(".").filter(Boolean);
  if (parts.length < 2) return clean;
  return parts.slice(-2).join(".");
}

function detectImpersonation(message, urls) {
  const text = message.toLowerCase();
  const matches = [];

  for (const organization of knownOrganizations) {
    const mentioned = organization.aliases.some((alias) => {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`, "i").test(text);
    });

    if (!mentioned) continue;

    for (const url of urls) {
      try {
        const parsed = new URL(url.startsWith("www.") ? `https://${url}` : url);
        const baseDomain = getBaseDomain(parsed.hostname);
        const official = organization.domains.includes(baseDomain);

        if (!official) {
          matches.push({
            organization: organization.name,
            claimed: organization.name,
            domain: parsed.hostname,
            officialDomains: organization.domains,
            points: 25,
            explanation: `The message mentions ${organization.name}, but the link uses ${parsed.hostname} instead of a recognized official domain. This can indicate impersonation.`,
          });
        }
      } catch {
        // URL parsing is already handled by URL intelligence.
      }
    }
  }

  const uniqueMatches = matches.filter(
    (match, index, list) =>
      index === list.findIndex(
        (item) =>
          item.organization === match.organization && item.domain === match.domain
      )
  );

  return {
    detected: uniqueMatches.length > 0,
    count: uniqueMatches.length,
    matches: uniqueMatches,
    risk: Math.min(uniqueMatches.reduce((sum, item) => sum + item.points, 0), 50),
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

function getRiskSummary(signals, urlAnalysis, impersonation, score) {
  const totalSignals = signals.length + urlAnalysis.indicators.length + impersonation.matches.length;

  if (totalSignals === 0) {
    return "No major measurable scam indicators were detected in this message.";
  }

  const evidence = [
    ...signals,
    ...urlAnalysis.indicators,
    ...impersonation.matches.map((item) => ({ name: `${item.organization} impersonation`, points: item.points })),
  ];
  const strongestSignal = evidence.sort((a, b) => b.points - a.points)[0];

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
  const impersonation = detectImpersonation(message, urlAnalysis.urls);
  score = Math.min(score + urlAnalysis.risk + impersonation.risk, 100);

  const riskLevel = calculateRiskLevel(score);
  const category = detectCategory(message);
  const recommendation = getRecommendation(riskLevel);
  const protectionActions = getProtectionActions(riskLevel, category);
  const riskSummary = getRiskSummary(signals, urlAnalysis, impersonation, score);

  return {
    riskScore: score,
    riskLevel,
    category,
    signals,
    evidence: {
      textSignals: signals.length,
      urlIndicators: urlAnalysis.indicators.length,
      impersonationMatches: impersonation.matches.length,
      totalSignals: signals.length + urlAnalysis.indicators.length + impersonation.matches.length,
    },
    urlAnalysis,
    impersonation,
    riskSummary,
    recommendation,
    protectionActions,
  };
}
