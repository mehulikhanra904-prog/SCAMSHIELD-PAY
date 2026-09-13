import { useState } from "react";

function buildReport(result) {
  const lines = [
    "SCAMSHIELD PAY — SECURITY REPORT",
    "================================",
    `Risk: ${result.riskLevel} (${result.riskScore}/100)`,
    `Category: ${result.category || "Unknown"}`,
    "",
    "RISK SUMMARY",
    result.riskSummary || "No summary available.",
    "",
    "DETECTION SIGNALS",
    ...(result.signals?.length
      ? result.signals.map((signal) => `- ${signal.name} (+${signal.points}): ${signal.explanation}`)
      : ["- No major scam indicators were detected." ]),
  ];

  if (result.urlAnalysis?.urls?.length) {
    lines.push("", "URL INTELLIGENCE");
    lines.push(...result.urlAnalysis.urls.map((url) => `- ${url}`));
    if (result.urlAnalysis.indicators?.length) {
      lines.push(...result.urlAnalysis.indicators.map((item) => `- ${item.name}: ${item.explanation}`));
    }
  }

  if (result.impersonation?.detected) {
    lines.push("", "IMPERSONATION");
    result.impersonation.matches?.forEach((match) => {
      lines.push(`- ${match.claimed} → ${match.domain}`);
    });
  }

  if (result.campaignAnalysis?.detected) {
    lines.push("", "CAMPAIGN DETECTION");
    lines.push(`- Campaign: ${result.campaignAnalysis.campaignId || "Unknown"}`);
    lines.push(`- Confidence: ${result.campaignAnalysis.confidence || 0}%`);
  }

  lines.push("", "RECOMMENDED ACTION", result.recommendation || "Verify independently before taking action.");
  lines.push("", "ScamShield Pay provides risk analysis, not a guarantee.");
  return lines.join("\n");
}

function ScanReport({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const report = buildReport(result);

  const downloadReport = () => {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `scamshield-report-${Date.now()}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareReport = async () => {
    if (!navigator.share) {
      await copyReport();
      return;
    }

    try {
      await navigator.share({ title: "ScamShield Pay Security Report", text: report });
    } catch {
      // User cancelled the native share sheet.
    }
  };

  return (
    <section className="scan-report-card">
      <div className="scan-report-heading">
        <div>
          <span className="small-label">NEW</span>
          <h3>📄 Security Report</h3>
          <p>Save or share the findings from this scan without exposing your history.</p>
        </div>
      </div>
      <div className="scan-report-actions">
        <button type="button" onClick={downloadReport}>⬇️ Download Report</button>
        <button type="button" onClick={copyReport}>{copied ? "✓ Copied" : "📋 Copy Report"}</button>
        <button type="button" onClick={shareReport}>↗️ Share Report</button>
      </div>
    </section>
  );
}

export default ScanReport;
