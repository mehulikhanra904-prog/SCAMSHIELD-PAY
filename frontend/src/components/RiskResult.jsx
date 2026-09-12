function RiskResult({ result, onReset }) {
  if (!result) {
    return (
      <div className="empty-result">

        <div className="empty-icon">
          🛡️
        </div>

        <h3>Your Security Report</h3>

        <p>
          Your scam analysis will appear here after you scan a message.
        </p>

        <div className="empty-line">
          <span></span>
          Waiting for message analysis
        </div>

      </div>
    );
  }

  const riskClass = result.riskLevel.toLowerCase();

  return (
    <div className="result-card">

      <div className="result-header">

        <div>
          <div className="small-label">
            SECURITY ANALYSIS COMPLETE
          </div>

          <h2>Risk Assessment</h2>
        </div>

        <div className="completed-badge">
          ✓ Analyzed
        </div>

      </div>

      <div className="risk-main">

        <div className={`score-circle ${riskClass}`}>

          <div className="score-inner">

            <span className="score-number">
              {result.riskScore}
            </span>

            <span className="score-total">
              /100
            </span>

          </div>

        </div>

        <div className="risk-info">

          <span className="score-title">
            SCAM RISK SCORE
          </span>

          <div className={`risk-badge ${riskClass}`}>
            <span className="risk-dot"></span>
            {result.riskLevel} Risk
          </div>

          <p>
            {result.riskLevel === "Critical"
              ? "This message contains multiple strong scam indicators."
              : result.riskLevel === "High"
              ? "Several suspicious indicators were detected."
              : result.riskLevel === "Moderate"
              ? "Some suspicious indicators require your attention."
              : "No major scam indicators were detected."}
          </p>

        </div>

      </div>

      {/* CATEGORY */}

      <div className="category-box">

        <div className="category-icon">
          🏷️
        </div>

        <div>
          <span>DETECTED CATEGORY</span>
          <strong>{result.category}</strong>
        </div>

      </div>

      {/* SIGNALS */}

      <div className="signals-section">

        <div className="section-title-row">

          <div>
            <span className="small-label">
              DETECTION DETAILS
            </span>

            <h3>Why was this flagged?</h3>
          </div>

          <span className="signal-count">
            {result.signals?.length || 0} signals
          </span>

        </div>

        {result.signals && result.signals.length > 0 ? (

          <div className="signals-list">

            {result.signals.map((signal, index) => (

              <div
                className="signal"
                key={index}
              >

                <div className="signal-icon">
                  ⚠️
                </div>

                <div className="signal-content">

                  <div className="signal-title">

                    <strong>
                      {signal.name}
                    </strong>

                    <span>
                      +{signal.points}
                    </span>

                  </div>

                  <p>
                    {signal.explanation}
                  </p>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="safe-message">
            ✓ No major scam indicators were detected.
          </div>

        )}

      </div>

      {/* RECOMMENDATION */}

      <div className="recommendation">

        <div className="recommendation-icon">
          🛡️
        </div>

        <div>

          <span className="small-label">
            RECOMMENDED ACTION
          </span>

          <h3>Stay Safe</h3>

          <p>
            {result.recommendation}
          </p>

        </div>

      </div>

      <button
        className="reset-button"
        onClick={onReset}
      >
        <span>↻</span>
        Scan Another Message
      </button>

    </div>
  );
}

export default RiskResult;