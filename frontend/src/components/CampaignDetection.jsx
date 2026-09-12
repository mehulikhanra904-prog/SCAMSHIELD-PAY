function CampaignDetection({ campaign }) {
  if (!campaign?.detected) return null;

  return (
    <section className="campaign-detection">
      <div className="campaign-header">
        <div className="campaign-icon">🧬</div>
        <div>
          <span className="small-label">SCAM CAMPAIGN DETECTION</span>
          <h3>Reusable scam pattern identified</h3>
        </div>
        <span className="campaign-confidence">{campaign.confidence}% match</span>
      </div>

      <div className="campaign-id-row">
        <span>CAMPAIGN FINGERPRINT</span>
        <strong>{campaign.campaignId}</strong>
      </div>

      <p className="campaign-explanation">{campaign.explanation}</p>

      {campaign.matchedTactics?.length > 0 && (
        <div className="campaign-tactics">
          <span className="small-label">MATCHED TACTICS</span>
          <div className="campaign-tags">
            {campaign.matchedTactics.map((tactic) => (
              <span key={tactic}>{tactic}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default CampaignDetection;
