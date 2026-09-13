import { useMemo, useState } from "react";

const CYBERCRIME_URL = "https://www.cybercrime.gov.in/";
const SUSPECT_URL = "https://cybercrime.gov.in/Webform/cyber_suspect.aspx";

function EmergencyResponse({ result }) {
  const [state, setState] = useState("not-paid");
  const [copied, setCopied] = useState(false);

  const incidentSummary = useMemo(() => {
    if (!result) return "";
    return [
      "ScamShield Pay — Incident Summary",
      `Risk: ${result.riskLevel} (${result.riskScore}/100)`,
      `Category: ${result.category || "Unknown"}`,
      result.campaignAnalysis?.campaignId ? `Campaign: ${result.campaignAnalysis.campaignId}` : "",
      result.urlAnalysis?.urls?.length ? `URL(s): ${result.urlAnalysis.urls.join(", ")}` : "",
      "Preserve screenshots, transaction IDs, sender details and other evidence.",
    ].filter(Boolean).join("\n");
  }, [result]);

  if (!result || !["High", "Critical"].includes(result.riskLevel)) return null;

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(incidentSummary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="emergency-response" aria-label="Emergency scam response">
      <div className="emergency-header">
        <div className="emergency-icon">🚨</div>
        <div>
          <span className="small-label">EMERGENCY RESPONSE MODE</span>
          <h3>Act quickly, but do not panic</h3>
          <p>This result is high risk. Choose what happened so ScamShield can show the safest next steps.</p>
        </div>
      </div>

      <div className="emergency-tabs">
        <button type="button" className={state === "not-paid" ? "active" : ""} onClick={() => setState("not-paid")}>
          I have not paid
        </button>
        <button type="button" className={state === "paid" ? "active" : ""} onClick={() => setState("paid")}>
          I already paid / shared details
        </button>
      </div>

      {state === "not-paid" ? (
        <div className="emergency-grid">
          <div className="emergency-step"><span>1</span><div><strong>Stop the interaction</strong><p>Do not click the link, approve a UPI request, call the message number, or send money.</p></div></div>
          <div className="emergency-step"><span>2</span><div><strong>Verify independently</strong><p>Open the bank, wallet or service app yourself. Never use contact details supplied by the suspicious message.</p></div></div>
          <div className="emergency-step"><span>3</span><div><strong>Preserve evidence</strong><p>Keep the message, URL, sender number, screenshots and any transaction information.</p></div></div>
        </div>
      ) : (
        <div className="emergency-grid">
          <div className="emergency-step urgent"><span>1</span><div><strong>Call 1930 now</strong><p>For cyber financial fraud in India, the National Cyber Crime Helpline is available 24×7.</p></div><a className="emergency-call" href="tel:1930">Call 1930</a></div>
          <div className="emergency-step"><span>2</span><div><strong>Contact your bank / payment provider</strong><p>Use the official app or number and report the unauthorized transaction immediately.</p></div></div>
          <div className="emergency-step"><span>3</span><div><strong>Preserve every detail</strong><p>Save transaction IDs, timestamps, screenshots, sender details and the suspicious URL.</p></div></div>
        </div>
      )}

      <div className="emergency-actions">
        <a href={CYBERCRIME_URL} target="_blank" rel="noreferrer">🛡️ Report cybercrime</a>
        <a href={SUSPECT_URL} target="_blank" rel="noreferrer">🚩 Report suspicious identifier</a>
        <button type="button" onClick={copySummary}>{copied ? "✓ Incident summary copied" : "📋 Copy incident summary"}</button>
      </div>

      <div className="emergency-note">
        <strong>India emergency guidance:</strong> the National Cyber Crime Reporting Portal lists 1930 as the cybercrime helpline and provides online reporting for cybercrime complaints.
      </div>
    </section>
  );
}

export default EmergencyResponse;
