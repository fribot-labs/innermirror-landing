import type {
  RuntimeInsightSynthesis,
  RuntimeSupportingInsight,
} from "../../types/runtimeContractV2";

type RuntimeInsightSynthesisPanelProps = {
  insight?: RuntimeInsightSynthesis;
};

export function RuntimeInsightSynthesisPanel({
  insight,
}: RuntimeInsightSynthesisPanelProps) {
  if (!insight) {
    return null;
  }

  return (
    <section className="runtime-insight-synthesis-panel">
      <div className="runtime-insight-synthesis-header">
        <span>Runtime Insight</span>

        <h3>{insight.title}</h3>

        <p>{insight.summary}</p>
      </div>

      <div className="runtime-insight-synthesis-primary">
        <span>Primary Insight</span>
        <strong>{insight.primaryInsight}</strong>
      </div>

      {insight.refinement ? (
        <div className="runtime-insight-refinement">
          <span>Insight Refinement</span>

          <h4>Supporting Insights</h4>

          <div className="runtime-insight-supporting-list">
            {insight.refinement.supportingInsights.map(
              (supportingInsight, index) => (
                <article
                  key={`${supportingInsight.source}-${index}-${supportingInsight.title}`}
                  className="runtime-insight-supporting-card"
                >
                  <span>{formatInsightSource(supportingInsight.source)}</span>

                  <strong>{supportingInsight.title}</strong>

                  <p>{supportingInsight.summary}</p>

                  <small>Confidence: {supportingInsight.confidence}</small>

                  {supportingInsight.evidence.length > 0 ? (
                    <ul>
                      {supportingInsight.evidence.map((item, itemIndex) => (
                        <li
                          key={`${supportingInsight.source}-${index}-${itemIndex}-${item}`}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              )
            )}
          </div>

          {insight.refinement.risk ? (
            <div className="runtime-insight-risk">
              <span>Risk</span>

              <strong>{insight.refinement.risk.title}</strong>

              <p>{insight.refinement.risk.summary}</p>

              <small>
                Severity: {insight.refinement.risk.severity}
              </small>
            </div>
          ) : null}

          <div className="runtime-insight-next-interpretation">
            <span>Next Interpretation</span>

            <strong>
              {insight.refinement.nextInterpretation}
            </strong>
          </div>
        </div>
      ) : null}

      <div className="runtime-insight-synthesis-grid">
        <div>
          <span>Confidence</span>
          <strong>{insight.confidence}</strong>
        </div>

        <div>
          <span>Recommended Focus</span>
          <strong>{insight.recommendedFocus}</strong>
        </div>
      </div>

      {insight.strategyRecommendation ? (
        <div className="runtime-insight-strategy">
          <span>Recommended Strategy</span>

          <strong>
            {insight.strategyRecommendation.recommendedPrDirection}
          </strong>

          <p>{insight.strategyRecommendation.summary}</p>

          {insight.strategyRecommendation.recommendedNextPrs.length > 0 ? (
            <ol>
              {insight.strategyRecommendation.recommendedNextPrs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          ) : null}

          <small>
            Priority: {insight.strategyRecommendation.priority} · Confidence:{" "}
            {insight.strategyRecommendation.confidence}
          </small>
        </div>
      ) : null}

      {insight.supportingSignals.length > 0 ? (
        <ul>
          {insight.supportingSignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function formatInsightSource(
  source: RuntimeSupportingInsight["source"]
): string {
  if (source === "project-evolution") {
    return "Project Evolution";
  }

  if (source === "decision-evolution") {
    return "Decision Evolution";
  }

  if (source === "project-identity") {
    return "Project Identity";
  }

  if (source === "knowledge-compression") {
    return "Knowledge Compression";
  }

  if (source === "strategy") {
    return "Strategy";
  }

  return "Runtime Signals";
}