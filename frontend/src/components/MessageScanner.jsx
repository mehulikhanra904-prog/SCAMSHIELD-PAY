import { useState } from "react";
import { analyzeMessage } from "../services/api";

function MessageScanner({ onResult }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const exampleMessage =
    "URGENT! Your bank KYC has expired. Your account will be blocked today. Click this link immediately to update KYC: https://example.com";

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setError("Please enter a message first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await analyzeMessage(message);

      if (result.success) {
        onResult(result.data);
      } else {
        setError(result.message || "Analysis failed.");
      }
    } catch (err) {
      console.error("Analysis error:", err);

      setError(
        "Cannot connect to the backend. Make sure your backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExample = () => {
    setMessage(exampleMessage);
    setError("");
  };

  return (
    <div className="scanner-card">
      {/* Background Glow */}
      <div className="scanner-glow"></div>

      {/* Header */}
      <div className="scanner-header">
        <div className="scanner-icon-wrapper">
          <span>🛡️</span>
        </div>

        <div className="scanner-title">
          <div className="small-label">
            SECURITY SCANNER
          </div>

          <h2>Scan a Suspicious Message</h2>

          <p>
            Paste an SMS, WhatsApp message, email or payment-related
            message below.
          </p>
        </div>
      </div>

      {/* Textarea */}
      <div className="textarea-wrapper">
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError("");
          }}
          placeholder="Paste the suspicious message here..."
          maxLength={5000}
          disabled={loading}
        />

        <div className="textarea-bottom">
          <span>🔒 Your message is analyzed securely</span>

          <span>
            {message.length}/5000
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="scanner-actions">
        <button
          className="example-button"
          onClick={handleExample}
          type="button"
          disabled={loading}
        >
          <span>✨</span>
          Try Example
        </button>

        <button
          className="analyze-button"
          onClick={handleAnalyze}
          disabled={loading || !message.trim()}
          type="button"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              <span>🔍</span>
              Analyze Message
              <span className="button-arrow">→</span>
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default MessageScanner;