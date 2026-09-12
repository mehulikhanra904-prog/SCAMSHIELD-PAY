import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "scamshield_scan_history";

function ThreatProfile() {
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
    window.addEventListener("storage", loadHistory);
    window.addEventListener("scamshield-history-updated", loadHistory);

    return () => {
      window.removeEventListener("storage", loadHistory);
      window.removeEventListener("scamshield-history-updated", loadHistory);
    };
  }, []);

  const stats = useMemo(() => {
    const scores = history.map((item) => Number(item.riskScore || 0));
    const averageRisk = scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;
    const highestRisk = scores.length ? Math.max(...scores) : 0;
    const highRisk = history.filter((item) =>
      ["HIGH", "CRITICAL"].includes(String(item.riskLevel).toUpperCase())
    ).length;
    const urls = history.filter((item) => item.urlDetected).length;
    const impersonation = history.filter((item) => item.impersonationDetected).length;
    const campaigns = history.filter((item) => item.campaignDetected).length;

    const categoryCounts = history.reduce((counts, item) => {
      const category = item.category || "Suspicious Communication";
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});

    const commonCategory = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "No pattern yet";

    let exposure = "No profile yet";
    if (history.length) {
      if (averageRisk >= 80) exposure = "Critical Exposure";
      else if (averageRisk >= 60) exposure = "High Exposure";
      else if (averageRisk >= 30) exposure = "Moderate Exposure";
      else exposure = "Low Exposure";
    }

    return {
      total: history.length,
      highRisk,
      urls,
      impersonation,
      campaigns,
      averageRisk,
      highestRisk,
      commonCategory,
      exposure,
    };
  }, [history]);

  return (
    <section className="threat-profile-section">
      <div className="threat-profile-heading">
        <div>
          <span className="small-label">PERSONAL SECURITY INSIGHT</span>
          <h2>🛡️ Your Threat Profile</h2>
          <p>
            A privacy-friendly security profile calculated from your recent scans on this device.
          </p>
        </div>
        <div className="threat-profile-status">
          <span className="status-dot" />
          LOCAL DATA ONLY
        </div>
      </div>

      <div className="threat-exposure-card">
        <div>
          <span className="small-label">CURRENT THREAT EXPOSURE</span>
          <h3>{stats.exposure}</h3>
          <p>
            {stats.total === 0
              ? "Run a few scans to generate your personal security profile."
              : `Based on an average risk score of ${stats.averageRisk}/100 across your recent scans.`}
          </p>
        </div>
        <div className="threat-exposure-score">
          <strong>{stats.averageRisk}</strong>
          <span>/100</span>
        </div>
      </div>

      <div className="threat-stat-grid">
        <div className="threat-stat-card"><span className="threat-stat-icon">🔎</span><div><strong>{stats.total}</strong><span>Total Scans</span></div></div>
        <div className="threat-stat-card"><span className="threat-stat-icon">⚠️</span><div><strong>{stats.highRisk}</strong><span>High/Critical</span></div></div>
        <div className="threat-stat-card"><span className="threat-stat-icon">🔗</span><div><strong>{stats.urls}</strong><span>URL Checks</span></div></div>
        <div className="threat-stat-card"><span className="threat-stat-icon">🎭</span><div><strong>{stats.impersonation}</strong><span>Impersonation</span></div></div>
        <div className="threat-stat-card"><span className="threat-stat-icon">🧬</span><div><strong>{stats.campaigns}</strong><span>Campaign Matches</span></div></div>
        <div className="threat-stat-card"><span className="threat-stat-icon">📈</span><div><strong>{stats.highestRisk}</strong><span>Highest Risk</span></div></div>
      </div>

      <div className="threat-profile-insight">
        <div className="threat-insight-icon">🎯</div>
        <div>
          <span className="small-label">MOST COMMON PATTERN</span>
          <h3>{stats.commonCategory}</h3>
          <p>
            {stats.total === 0
              ? "Your profile will become more meaningful after several different scans."
              : "This category appears most often in your recent local scan history."}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ThreatProfile;
