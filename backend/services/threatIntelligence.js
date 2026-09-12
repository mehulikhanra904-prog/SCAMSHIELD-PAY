const threatProfiles = {
  "Bank / KYC Scam": {
    threatType: "Credential phishing",
    target: "Bank customers",
    description: "Attackers imitate banks or KYC services to capture credentials, OTPs, or account information.",
  },
  "UPI / Payment Scam": {
    threatType: "Payment fraud",
    target: "UPI and digital-payment users",
    description: "Attackers pressure victims to approve payments, transfer money, or pay fake fees.",
  },
  "Account Takeover Scam": {
    threatType: "Account takeover",
    target: "Online accounts",
    description: "Attackers attempt to obtain OTPs, passwords, PINs, or verification codes.",
  },
  "Job Scam": {
    threatType: "Recruitment fraud",
    target: "Job seekers",
    description: "Fake opportunities are used to collect fees, personal information, or financial details.",
  },
  "Reward / Cashback Scam": {
    threatType: "Reward phishing",
    target: "Consumers and payment users",
    description: "Fake rewards, cashback, prizes, or bonuses are used to drive clicks or payments.",
  },
  "Investment Scam": {
    threatType: "Investment fraud",
    target: "Investors and retail users",
    description: "Fraudsters use profit promises and urgency to persuade victims to transfer funds.",
  },
  "Delivery Scam": {
    threatType: "Delivery phishing",
    target: "Online shoppers",
    description: "Fake parcel or delivery problems are used to collect payment or personal information.",
  },
  "Loan Scam": {
    threatType: "Loan fraud",
    target: "Loan seekers",
    description: "Fake lenders request advance fees or sensitive information before releasing a loan.",
  },
  "Tech Support Scam": {
    threatType: "Technical-support fraud",
    target: "Device and software users",
    description: "Fake support alerts attempt to make victims call, install remote-access tools, or pay.",
  },
  "Government Impersonation Scam": {
    threatType: "Authority impersonation",
    target: "Citizens",
    description: "Attackers impersonate government authorities and use penalties or legal threats.",
  },
};

export function buildThreatIntelligence(analysis, previousMatches = 0) {
  const category = analysis.category || "Suspicious Communication";
  const campaign = analysis.campaignAnalysis;
  const profile = threatProfiles[category] || {
    threatType: "Suspicious communication",
    target: "General users",
    description: "The message contains signals that require independent verification.",
  };

  const hasCampaign = Boolean(campaign?.detected && campaign?.campaignId);
  const status = previousMatches > 0
    ? "Previously seen"
    : hasCampaign
      ? "New pattern"
      : "Unclassified";

  const confidence = previousMatches > 0
    ? Math.min(99, 80 + Math.min(previousMatches, 5) * 3)
    : hasCampaign
      ? Math.max(55, campaign.confidence || 55)
      : 0;

  let explanation;
  if (previousMatches > 0) {
    explanation = `This campaign fingerprint has appeared ${previousMatches} time${previousMatches === 1 ? "" : "s"} before in ScamShield Pay's local threat database.`;
  } else if (hasCampaign) {
    explanation = "The engine has created a fingerprint for this reusable scam pattern. It can be matched against future scans without depending on identical wording.";
  } else {
    explanation = "There is not enough campaign evidence to create a reliable reusable threat fingerprint.";
  }

  return {
    status,
    confidence,
    campaignId: campaign?.campaignId || "",
    threatType: profile.threatType,
    target: profile.target,
    description: profile.description,
    previousMatches,
    source: "ScamShield Pay local threat database",
    explanation,
  };
}
