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
    const highRisk = history.filter((item) =>
      ["HIGH", "CRITICAL"].includes(String(item.riskLevel).toUpperCase())
    ).length;
    const urls = history.filter((item) => item.urlDetected).length;
    const impersonation = history.filter((item) => item.impersonationDetected).length;

    const categoryCounts = history.reduce((counts, item) => {
      const category = item.category || "Suspicious Communication";
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});

    const commonCategory = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "No pattern yet";

    return {
      total: history.length,
      highRisk,
      urls,
      impersonation,
      commonCategory,
    };
  }, [history]);

  return (
    <section className="threat-profile-section">
      <div className="threat-profile-heading">
        <div>
          <span className="small-label">PERSONAL SECURITY INSIGHT</span>
          <h2>🛡️ Your Threat Profile</h2>
          <p>
            A privacy-friendly summary based only on your recent scans on this device.
          </p>
        </div>
        <div className="threat-profile-status">
          <span className="status-dot" />
          LOCAL DATA ONLY
        </div>
      </div>

      <div className="threat-stat-grid">
        <div className="threat-stat-card">
          <span className="threat-stat-icon">🔎</span>
          <div>
            <strong>{stats.total}</strong>
            <span>Total Scans</span>
          </div>
        </div>

        <div className="threat-stat-card">
          <span className="threat-stat-icon">⚠️</span>
          <div>
            <strong>{stats.highRisk}</strong>
            <span>High/Critical</span>
          </div>
        </div>

        <div className="threat-stat-card">
          <span className="threat-stat-icon">🔗</span>
          <div>
            <strong>{stats.urls}</strong>
            <span>URL Checks</span>
          </div>
        </div>

        <div className="threat-stat-card">
          <span className="threat-stat-icon">🎭</span>
          <div>
            <strong>{stats.impersonation}</strong>
            <span>Impersonation</span>
          </div>
        </div>
      </div>

      <div className="threat-profile-insight">
        <div className="threat-insight-icon">🎯</div>
        <div>
          <span className="small-label">MOST COMMON PATTERN</span>
          <h3>{stats.commonCategory}</h3>
          <p>
            {stats.total === 0
              ? "Run a few scans to build your personal security profile."
              : "This is the category appearing most often in your recent local scan history."}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ThreatProfile;
