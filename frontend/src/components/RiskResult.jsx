import CampaignDetection from "./CampaignDetection";

function RiskResult({ result, onReset }) {
  if (!result) {
    return <div className="empty-result"><div className="empty-icon">🛡️</div><h3>Your Security Report</h3><p>Your scam analysis will appear here after you scan a message.</p><div className="empty-line"><span></span>Waiting for message analysis</div></div>;
  }

  const riskClass = result.riskLevel.toLowerCase();
  const urlAnalysis = result.urlAnalysis;
  const hasUrls = Boolean(urlAnalysis?.found && urlAnalysis?.count);
  const impersonation = result.impersonation;
  const hasImpersonation = Boolean(impersonation?.detected && impersonation?.count);
  const categoryAnalysis = result.categoryAnalysis;
  const categoryProtection = {
    "Bank / KYC Scam": { do: ["Open your bank app directly instead of using the message link.", "Verify KYC status through the bank's official website or app."], dont: ["Do not share OTP, PIN, CVV, card details, or passwords."] },
    "UPI / Payment Scam": { do: ["Check the payment request inside your official UPI app.", "Contact the recipient or business using a trusted contact method."], dont: ["Do not approve an unexpected collect request or send money to receive money."] },
    "Account Takeover Scam": { do: ["Open the official app directly and review recent account activity.", "Change your password through the official service if you suspect compromise."], dont: ["Never share OTPs, PINs, passwords, CVV, or verification codes."] },
    "Job Scam": { do: ["Verify the employer and vacancy through its official careers page."], dont: ["Never pay a recruitment, registration, training, or document fee to get a job."] },
    "Reward / Cashback Scam": { do: ["Check promotions inside the official app or website."], dont: ["Do not pay a fee or provide banking credentials to claim a reward or cashback."] },
    "Investment Scam": { do: ["Verify the investment provider independently before transferring any money."], dont: ["Do not trust guaranteed, unusually high, or pressure-based returns."] },
    "Delivery Scam": { do: ["Check the parcel status through the official courier or shopping app."], dont: ["Do not pay an unexpected delivery fee through a message link."] },
    "Loan Scam": { do: ["Verify the lender through its official website and trusted channels."], dont: ["Do not pay an advance fee to unlock or approve a loan."] },
    "Tech Support Scam": { do: ["Use the vendor's official support page if you need technical help."], dont: ["Do not install remote-access software or call an unexpected support number."] },
    "Government Impersonation Scam": { do: ["Verify notices through the official government website or known office contact details."], dont: ["Do not pay penalties or share documents because of an unverified message."] },
  };
  const protection = categoryProtection[result.category] || { do: ["Verify the sender through an independent, trusted channel."], dont: ["Do not click unexpected links, share sensitive information, or send money."] };
  const highRisk = ["High", "Critical"].includes(result.riskLevel);

  return <div className="result-card">
    <div className="result-header"><div><div className="small-label">SECURITY ANALYSIS COMPLETE</div><h2>Risk Assessment</h2></div><div className="completed-badge">✓ Analyzed</div></div>
    <div className="risk-main"><div className={`score-circle ${riskClass}`}><div className="score-inner"><span className="score-number">{result.riskScore}</span><span className="score-total">/100</span></div></div><div className="risk-info"><span className="score-title">SCAM RISK SCORE</span><div className={`risk-badge ${riskClass}`}><span className="risk-dot"></span>{result.riskLevel} Risk</div><p>{result.riskLevel === "Critical" ? "This message contains multiple strong scam indicators." : result.riskLevel === "High" ? "Several suspicious indicators were detected." : result.riskLevel === "Moderate" ? "Some suspicious indicators require your attention." : "No major scam indicators were detected."}</p></div></div>
    <div className="category-box"><div className="category-icon">🏷️</div><div><span>DETECTED CATEGORY</span><strong>{result.category}</strong>{categoryAnalysis && <><div style={{marginTop:"8px"}}><span>RULE-BASED MATCH STRENGTH</span><strong>{categoryAnalysis.matchStrength} · {categoryAnalysis.confidence}%</strong></div>{categoryAnalysis.matchedKeywords?.length > 0 && <div style={{marginTop:"8px"}}><span>MATCHED EVIDENCE</span><strong>{categoryAnalysis.matchedKeywords.join(", ")}</strong></div>}<p style={{marginTop:"8px"}}>{categoryAnalysis.description}</p></>}</div></div>
    {categoryAnalysis?.advice && <div className="recommendation" style={{marginTop:"16px"}}><div className="recommendation-icon">🎯</div><div><span className="small-label">CATEGORY-SPECIFIC PROTECTION</span><h3>What should you do?</h3><p>{categoryAnalysis.advice}</p></div></div>}
    <CampaignDetection campaign={result.campaignAnalysis} />
    <div className="recommendation" style={{marginTop:"16px"}}><div className="recommendation-icon">🛡️</div><div style={{width:"100%"}}><span className="small-label">PROTECTION MODE</span><h3>{highRisk ? "Pause before you act" : "Verify before you act"}</h3><p>{highRisk ? "This result is high risk. Treat the message as unsafe until you independently verify it." : "Use these checks before interacting with the sender, link, or payment request."}</p><div style={{marginTop:"12px"}}><strong>✅ DO</strong>{protection.do.map((action,index)=><p key={`do-${index}`} style={{margin:"6px 0 0"}}>• {action}</p>)}</div><div style={{marginTop:"12px"}}><strong>🚫 DON'T</strong>{protection.dont.map((action,index)=><p key={`dont-${index}`} style={{margin:"6px 0 0"}}>• {action}</p>)}</div></div></div>
    {hasImpersonation && <div className="impersonation-box"><div className="section-title-row"><div><span className="small-label">IMPERSONATION DETECTION</span><h3>Claimed organization vs actual domain</h3></div><span className="impersonation-risk-badge">+{impersonation.risk} risk</span></div><div className="impersonation-warning">⚠️ Possible brand impersonation detected</div><div className="impersonation-list">{impersonation.matches.map((match,index)=><div className="impersonation-item" key={index}><div className="impersonation-row"><span>Claimed organization</span><strong>{match.claimed}</strong></div><div className="impersonation-row"><span>Actual domain</span><strong>{match.domain}</strong></div><div className="impersonation-row"><span>Recognized official domain</span><strong>{match.officialDomains.join(" or ")}</strong></div><p>{match.explanation}</p></div>)}</div></div>}
    {hasUrls && <div className="url-intelligence"><div className="section-title-row"><div><span className="small-label">URL INTELLIGENCE</span><h3>What did we find in the link?</h3></div><span className="url-risk-badge">URL Risk: {urlAnalysis.risk}/60</span></div><div className="analyzed-url-count">🔗 {urlAnalysis.count} URL{urlAnalysis.count===1?"":"s"} analyzed</div>{urlAnalysis.indicators?.length > 0 ? <div className="url-indicators">{urlAnalysis.indicators.map((indicator,index)=><div className="url-indicator" key={index}><div className="url-indicator-icon">⚠️</div><div><strong>{indicator.name}</strong><p>{indicator.explanation}</p></div></div>)}</div> : <div className="url-safe-message">✓ No suspicious URL characteristics were detected.</div>}{urlAnalysis.urls?.length > 0 && <div className="url-list"><span className="url-list-label">ANALYZED LINKS</span>{urlAnalysis.urls.map((url,index)=><div className="url-item" key={index} title={url}>🔗 {url}</div>)}</div>}</div>}
    <div className="signals-section"><div className="section-title-row"><div><span className="small-label">DETECTION DETAILS</span><h3>Why was this flagged?</h3></div><span className="signal-count">{result.evidence?.totalSignals ?? result.signals?.length ?? 0} signals</span></div>{result.signals?.length > 0 ? <div className="signals-list">{result.signals.map((signal,index)=><div className="signal" key={index}><div className="signal-icon">⚠️</div><div className="signal-content"><div className="signal-title"><strong>{signal.name}</strong><span>+{signal.points}</span></div><p>{signal.explanation}</p></div></div>)}</div> : <div className="safe-message">✓ No major scam indicators were detected.</div>}</div>
    <div className="recommendation"><div className="recommendation-icon">🛡️</div><div><span className="small-label">RECOMMENDED ACTION</span><h3>Stay Safe</h3><p>{result.recommendation}</p></div></div>
    <button className="reset-button" onClick={onReset}><span>↻</span>Scan Another Message</button>
  </div>;
}

export default RiskResult;
