import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "scamshield_scan_history";
const MAX_HISTORY = 10;

function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function notifyHistoryChanged(history) {
  window.dispatchEvent(
    new CustomEvent("scamshield-history-updated", {
      detail: { history },
    })
  );
}

function ScanHistory({ latestResult }) {
  const [history, setHistory] = useState(readHistory);

  useEffect(() => {
    const syncHistory = (event) => {
      if (event?.detail?.history) {
        setHistory(event.detail.history);
      } else {
        setHistory(readHistory());
      }
    };

    window.addEventListener("scamshield-history-updated", syncHistory);
    window.addEventListener("storage", syncHistory);

    return () => {
      window.removeEventListener("scamshield-history-updated", syncHistory);
      window.removeEventListener("storage", syncHistory);
    };
  }, []);

  useEffect(() => {
    if (!latestResult) return;

    const entry = {
      id: latestResult._id || `${Date.now()}-${Math.random()}`,
      scannedAt: new Date().toISOString(),
      riskScore: Number(latestResult.riskScore || 0),
      riskLevel: latestResult.riskLevel || "UNKNOWN",
      category: latestResult.category || "Suspicious Communication",
      urlDetected: Boolean(latestResult.urlAnalysis?.urls?.length),
      impersonationDetected: Boolean(latestResult.impersonation?.detected),
      campaignDetected: Boolean(latestResult.campaignAnalysis?.detected),
      campaignId: latestResult.campaignAnalysis?.campaignId || "",
    };

    setHistory((current) => {
      const alreadyExists = current.some((item) => item.id === entry.id);
      if (alreadyExists) return current;

      const updated = [entry, ...current].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifyHistoryChanged(updated);
      return updated;
    });
  }, [latestResult]);

  const stats = useMemo(() => {
    if (!history.length) return { average: 0, highest: 0 };
    const scores = history.map((item) => Number(item.riskScore || 0));
    return {
      average: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
      highest: Math.max(...scores),
    };
  }, [history]);

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
    notifyHistoryChanged([]);
  };

  const riskClass = (level) => String(level).toLowerCase().replace(/\s+/g, "-");

  return (
    <section className="scan-history-card">
      <div className="scan-history-header">
        <div>
          <span className="small-label">SECURITY ACTIVITY</span>
          <h2>🕒 Scan History</h2>
          <p>Your recent ScamShield risk checks on this device.</p>
        </div>
        {history.length > 0 && (
          <button type="button" className="example-button" onClick={clearHistory}>
            Clear History
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div className="history-summary">
          <div><strong>{stats.average}</strong><span>Average Risk</span></div>
          <div><strong>{stats.highest}</strong><span>Highest Risk</span></div>
          <div><strong>{history.length}</strong><span>Recent Scans</span></div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="scan-history-empty">
          <span>🛡️</span>
          <strong>No scans yet</strong>
          <p>Your completed scans will appear here.</p>
        </div>
      ) : (
        <div className="scan-history-list">
          {history.map((item) => (
            <article className="scan-history-item" key={item.id}>
              <div className={`history-risk risk-${riskClass(item.riskLevel)}`}>
                <strong>{item.riskScore}</strong>
                <span>/100</span>
              </div>

              <div className="history-main">
                <strong>{item.category}</strong>
                <span>{item.riskLevel} risk · {new Date(item.scannedAt).toLocaleString()}</span>
                <div className="history-flags">
                  {item.urlDetected && <span>🔗 URL checked</span>}
                  {item.impersonationDetected && <span>🎭 Impersonation detected</span>}
                  {item.campaignDetected && <span>🧬 Campaign matched</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ScanHistory;
