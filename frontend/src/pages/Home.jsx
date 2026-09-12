import { useState } from "react";
import MessageScanner from "../components/MessageScanner";
import RiskResult from "../components/RiskResult";
import ScanHistory from "../components/ScanHistory";
import ThreatProfile from "../components/ThreatProfile";

function Home() {
  const [result, setResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-badge">
          <span className="badge-pulse"></span>
          AI-Powered Scam Protection
        </div>

        <h1>
          Stop the Scam
          <br />
          <span>Before the Payment.</span>
        </h1>

        <p>
          Detect suspicious messages, identify scam patterns and understand
          the risks before you click, pay or share sensitive information.
        </p>

        <div className="hero-features">
          <div className="hero-feature"><span>⚡</span>Instant Analysis</div>
          <div className="hero-feature"><span>🔐</span>Privacy Focused</div>
          <div className="hero-feature"><span>🧠</span>Smart Detection</div>
        </div>
      </section>

      <section className="history-action-section">
        <div className="history-action-card">
          <div className="history-action-icon">🛡️</div>
          <div className="history-action-copy">
            <span>SECURITY ACTIVITY</span>
            <h2>{showHistory ? "Review Your Scan History" : "Your Security Dashboard"}</h2>
            <p>
              {showHistory
                ? "Review your recent risk checks and detected security signals."
                : "Track your recent scam checks and return to scanning anytime."}
            </p>
          </div>
          <button
            type="button"
            className="history-toggle"
            onClick={() => setShowHistory((value) => !value)}
          >
            {showHistory ? "←  Back to Scanner" : "🕒  View Scan History"}
          </button>
        </div>
      </section>

      <section className="scanner-section">
        {showHistory ? (
          <ScanHistory latestResult={result} />
        ) : (
          <>
            <MessageScanner onResult={setResult} />
            <RiskResult result={result} onReset={() => setResult(null)} />
          </>
        )}
      </section>

      <ThreatProfile />

      <section className="how-section">
        <div className="section-heading">
          <span>HOW IT WORKS</span>
          <h2>Your safety check in<span> 3 simple steps</span></h2>
        </div>

        <div className="steps">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">📩</div>
            <h3>Paste Message</h3>
            <p>Copy a suspicious SMS, WhatsApp message, email or payment request and paste it into the scanner.</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">🔍</div>
            <h3>Analyze Risk</h3>
            <p>ScamShield checks the message for suspicious patterns, manipulation tactics and financial red flags.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">🛡️</div>
            <h3>Stay Protected</h3>
            <p>Get a risk score, explanation and clear recommendation about what you should do next.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
