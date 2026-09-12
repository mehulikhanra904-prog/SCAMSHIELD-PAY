function ThreatIntelligence({ threat }) {
  if (!threat) return null;

  const isKnown = threat.status === "Previously seen";
  const isNew = threat.status === "New pattern";

  return (
    <section className="threat-intelligence">
      <div className="threat-intel-header">
        <div className="threat-intel-icon">🌐</div>
        <div>
          <span className="small-label">THREAT INTELLIGENCE</span>
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

      <p className="threat-intel-description">{threat.description}</p>
      <p className="threat-intel-explanation">{threat.explanation}</p>

      {isKnown && (
        <div className="threat-match-warning">⚠️ This pattern has already appeared in ScamShield Pay's local threat database. Similar wording is not required for a campaign match.</div>
      )}

      <div className="threat-intel-source">SOURCE · {threat.source || "ScamShield Pay"}</div>
    </section>
  );
}

export default ThreatIntelligence;
