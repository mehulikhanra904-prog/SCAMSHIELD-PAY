import { useMemo, useState } from "react";

const categoryActions = {
  "Bank / KYC Scam": [
    "Open your bank app directly and check the KYC/account alert.",
    "Use only the bank's official website or verified customer-care channel.",
    "Never share OTP, PIN, CVV, card details, or passwords.",
  ],
  "UPI / Payment Scam": [
    "Open your UPI app directly and inspect the payment request.",
    "Verify the recipient using a trusted contact method.",
    "Never approve an unexpected collect request or pay a fee to receive money.",
  ],
  "Account Takeover Scam": [
    "Open the official service directly and review recent account activity.",
    "Change your password through the official app/site if compromise is suspected.",
    "Never share OTPs, PINs, passwords, CVV, or verification codes.",
  ],
  "Job Scam": [
    "Verify the employer and vacancy through its official careers page.",
    "Confirm recruiter details independently before sharing documents.",
    "Never pay a recruitment, registration, training, or document fee.",
  ],
  "Reward / Cashback Scam": [
    "Check the promotion inside the official app or website.",
    "Verify the offer independently before providing information.",
    "Never pay a fee to claim a reward or cashback.",
  ],
  "Investment Scam": [
    "Verify the investment provider independently before transferring money.",
    "Check whether the promised returns are realistic and regulated where applicable.",
    "Never transfer funds because of pressure or guaranteed-return claims.",
  ],
  "Delivery Scam": [
    "Check the parcel through the official courier or shopping app.",
    "Verify delivery details using a trusted channel.",
    "Do not pay an unexpected delivery fee through a message link.",
  ],
  "Loan Scam": [
    "Verify the lender through its official website and trusted channels.",
    "Read the official loan terms before sharing documents.",
    "Never pay an advance fee to unlock or approve a loan.",
  ],
  "Tech Support Scam": [
    "Use the vendor's official support page instead of the message contact.",
    "End unexpected support calls or pop-ups requesting urgent action.",
    "Never install remote-access software because of an unsolicited alert.",
  ],
  "Government Impersonation Scam": [
    "Verify the notice through the official government website or known office.",
    "Use independently sourced contact details, not those in the message.",
    "Do not pay penalties or share documents because of an unverified threat.",
  ],
};

function ProtectionMode({ result }) {
  const [completed, setCompleted] = useState([]);
  const [copied, setCopied] = useState(false);

  const highRisk = ["High", "Critical"].includes(result?.riskLevel);
  const actions = useMemo(() => {
    const categoryActionsList = categoryActions[result?.category] || [
      "Verify the sender through an independent, trusted channel.",
      "Do not click unexpected links or download unknown files.",
      "Do not share sensitive information or send money until verified.",
    ];

    return [
      { id: "pause", icon: "⏸️", title: "Pause", text: highRisk ? "Do not interact with the message while it is high risk." : "Do not act until you have independently verified the request." },
      { id: "verify", icon: "🔎", title: "Verify independently", text: categoryActionsList[0] },
      { id: "credentials", icon: "🔐", title: "Protect credentials", text: categoryActionsList[2] },
      { id: "report", icon: "🚩", title: "Report safely", text: "If fraudulent, report it through the relevant bank, payment app, platform, or official authority using a trusted channel." },
    ];
  }, [result?.category, highRisk]);

  if (!result) return null;

  const toggle = (id) => {
    setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const copyReport = async () => {
    const report = [
      "ScamShield Pay Security Report",
      `Risk: ${result.riskScore}/100 (${result.riskLevel})`,
      `Category: ${result.category}`,
      result.campaignAnalysis?.campaignId ? `Campaign: ${result.campaignAnalysis.campaignId}` : "",
      result.threatIntelligence?.threatType ? `Threat type: ${result.threatIntelligence.threatType}` : "",
      "Do not click links, share credentials, or send money until independently verified.",
    ].filter(Boolean).join("\n");

    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const progress = Math.round((completed.length / actions.length) * 100);

  return (
    <section className="protection-mode">
      <div className="protection-header">
        <div className="protection-icon">🛡️</div>
        <div>
          <span className="small-label">PROTECTION MODE 2.0</span>
          <h3>{highRisk ? "Pause before you act" : "Verify before you act"}</h3>
          <p>Turn the security result into a simple safety checklist.</p>
        </div>
        <span className={`protection-risk ${highRisk ? "danger" : "caution"}`}>{result.riskLevel} risk</span>
      </div>

      <div className="protection-progress">
        <div><span>SAFETY CHECKLIST</span><strong>{completed.length}/{actions.length} completed</strong></div>
        <div className="protection-progress-track"><span style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="protection-actions">
        {actions.map((action, index) => {
          const done = completed.includes(action.id);
          return (
            <button type="button" className={`protection-action ${done ? "done" : ""}`} key={action.id} onClick={() => toggle(action.id)}>
              <span className="protection-step">{done ? "✓" : index + 1}</span>
              <span className="protection-action-icon">{action.icon}</span>
              <span className="protection-action-copy"><strong>{action.title}</strong><small>{action.text}</small></span>
              <span className="protection-check">{done ? "Completed" : "Mark done"}</span>
            </button>
          );
        })}
      </div>

      <div className="protection-footer">
        <div><strong>🚨 Never use the suspicious message itself to verify the claim.</strong><span>Open the official app/site yourself or use a trusted contact method.</span></div>
        <button type="button" className="copy-report-button" onClick={copyReport}>{copied ? "✓ Report copied" : "Copy security report"}</button>
      </div>
    </section>
  );
}

export default ProtectionMode;
