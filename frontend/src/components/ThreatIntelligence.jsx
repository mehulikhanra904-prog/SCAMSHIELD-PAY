import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "scamshield_scan_history";

function ThreatIntelligence({ threat }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        setHistory(Array.isArray(saved) ? saved : []);
      } catch {
        setHistory([]);
      }
    };

    loadHistory();
    window.addEventListener("scamshield-history-updated", loadHistory);
    return () => window.removeEventListener("scamshield-history-updated", loadHistory);
  }, []);

  if (!threat) return null;

  const isKnown = threat.status === "Previously seen";
  const isNew = threat.status === "New pattern";

  const intelligence = useMemo(() => {
    const categoryCounts = history.reduce((counts, item) => {
      const category = item.category || "Suspicious Communication";
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});

    const commonCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    const campaignMatches = history.filter((item) => item.campaignDetected).length;
    const urlThreats = history.filter((item) => item.urlDetected).length;
    const impersonationThreats = history.filter((item) => item.impersonationDetected).length;

    return {
      commonCategory: commonCategory?.[0] || threat.threatType || "No repeated category yet",
      commonCategoryCount: commonCategory?.[1] || 0,
      campaignMatches,
      urlThreats,
      impersonationThreats,
    };
  }, [history, threat.threatType]);

  return (
    <section className="threat-intelligence">
      <div className="threat-intel-header">
        <div className="threat-intel-icon">🌐</div>
        <div>
          <span className="small-label">THREAT INTELLIGENCE 2.0</span>
          <h3>{isKnown ? "Related scam pattern found" : isNew ? "New threat pattern recorded" : "Threat profile"}</h3>
        </div>
        <span className={`threat-status ${isKnown ? "known" : isNew ? "new" : "unknown"}`}>
          {threat.status}
        </span>
      </div>

      <div className="threat-grid">
        <div><span>THREAT TYPE</span><strong>{threat.threatType || "—"}</strong></div>
        <div><span>LIKELY TARGET</span><strong>{threat.target || "—"}</strong></div>
        {threat.campaignId && <div><span>CAMPAIGN ID</span><strong>{threat.campaignId}</strong></div>}
        <div><span>CONFIDENCE</span><strong>{threat.confidence ? `${threat.confidence}%` : "—"}</strong></div>
      </div>

      <div className="intel-history-grid">
        <div><strong>{intelligence.campaignMatches}</strong><span>Campaign matches</span></div>
        <div><strong>{intelligence.urlThreats}</strong><span>URL threats seen</span></div>
        <div><strong>{intelligence.impersonationThreats}</strong><span>Impersonation signals</span></div>
        <div><strong>{intelligence.commonCategoryCount}</strong><span>Top pattern count</span></div>
      </div>

      <div className="intel-pattern-row">
        <span className="small-label">MOST REPEATED LOCAL PATTERN</span>
        <strong>{intelligence.commonCategory}</strong>
        <span>
          {history.length
            ? "Based on the recent scans stored locally on this device."
            : "Run more scans to build a local threat pattern."}
        </span>
      </div>

      <p className="threat-intel-description">{threat.description}</p>
      <p className="threat-intel-explanation">{threat.explanation}</p>

      {isKnown && (
        <div className="threat-match-warning">⚠️ This pattern has already appeared in ScamShield Pay's local threat database. Similar wording is not required for a campaign match.</div>
      )}

      {isNew && (
        <div className="threat-new-note">🆕 This is treated as a new local pattern. Future scans with the same campaign fingerprint can be recognized as related.</div>
      )}

      <div className="threat-intel-source">SOURCE · {threat.source || "ScamShield Pay"}</div>
    </section>
  );
}

export default ThreatIntelligence;
