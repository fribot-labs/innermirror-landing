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

  const topEvidence = getTopEvidence(insight);
  const nextInterpretation =
    insight.refinement?.nextInterpretation;

  return (
    <section className="runtime-insight-synthesis-panel runtime-insight-synthesis-panel-primary">
      <div className="runtime-insight-synthesis-header">
        <span>Current Runtime Understanding</span>

        <h3>{insight.primaryInsight}</h3>

        <p>{insight.summary}</p>
      </div>

      {insight.refinement?.nextInterpretation ? (
        <div className="runtime-insight-next-action">
          <span>Next Interpretation</span>

          <strong>
            {insight.refinement.nextInterpretation}
          </strong>
        </div>
      ) : null}

      <div className="runtime-insight-next-action">
        <span>Recommended Focus</span>

        <strong>{insight.recommendedFocus}</strong>
      </div>

      {getTopEvidence(insight).length > 0 ? (
        <div className="runtime-insight-trust-evidence">
          <span>Why Runtime thinks this</span>

          <p className="runtime-guidance">
            Runtime is still learning from your project history. More Reflection and
            Project Analyze records will improve confidence.
          </p>

          <ul>
            {getTopEvidence(insight).map((item, index) => (
              <li
                key={`runtime-evidence-${index}-${item}`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="runtime-insight-confidence-row">
        <span>Confidence</span>

        <strong>{insight.confidence}</strong>
      </div>

      {insight.strategyRecommendation ? (
        <div className="runtime-insight-strategy-compact">
          <span>Recommended Strategy</span>

          <strong>
            {
              insight.strategyRecommendation
                .recommendedPrDirection
            }
          </strong>

          <small>
            Priority:{" "}
            {insight.strategyRecommendation.priority}
            {" · "}
            Confidence:{" "}
            {
              insight.strategyRecommendation
                .confidence
            }
          </small>

          <details>
            <summary>View strategy details</summary>

            <p>
              {insight.strategyRecommendation.summary}
            </p>

            {insight.strategyRecommendation
              .recommendedNextPrs.length > 0 ? (
              <ol>
                {insight.strategyRecommendation.recommendedNextPrs.map(
                  (item, index) => (
                    <li
                      key={`strategy-${index}-${item}`}
                    >
                      {item}
                    </li>
                  )
                )}
              </ol>
            ) : null}
          </details>
        </div>
      ) : null}

      {insight.refinement ? (
        <details className="runtime-insight-advanced">
          <summary>View supporting reasoning</summary>

          <div className="runtime-insight-refinement">
            <h4>Supporting Insights</h4>

            <div className="runtime-insight-supporting-list">
              {insight.refinement.supportingInsights.map(
                (
                  supportingInsight,
                  index
                ) => (
                  <article
                    key={`${supportingInsight.source}-${index}-${supportingInsight.title}`}
                    className="runtime-insight-supporting-card"
                  >
                    <span>
                      {formatInsightSource(
                        supportingInsight.source
                      )}
                    </span>

                    <strong>
                      {supportingInsight.title}
                    </strong>

                    <p>
                      {supportingInsight.summary}
                    </p>

                    <small>
                      Confidence:{" "}
                      {
                        supportingInsight.confidence
                      }
                    </small>

                    {supportingInsight.evidence
                      .length > 0 ? (
                      <ul>
                        {supportingInsight.evidence.map(
                          (
                            item,
                            itemIndex
                          ) => (
                            <li
                              key={`${supportingInsight.source}-${index}-${itemIndex}-${item}`}
                            >
                              {item}
                            </li>
                          )
                        )}
                      </ul>
                    ) : null}
                  </article>
                )
              )}
            </div>

            {insight.refinement.risk ? (
              <div className="runtime-insight-risk">
                <span>Risk</span>

                <strong>
                  {
                    insight.refinement.risk
                      .title
                  }
                </strong>

                <p>
                  {
                    insight.refinement.risk
                      .summary
                  }
                </p>

                <small>
                  Severity:{" "}
                  {
                    insight.refinement.risk
                      .severity
                  }
                </small>
              </div>
            ) : null}
          </div>
        </details>
      ) : null}

      {insight.supportingSignals.length > 0 ? (
        <details className="runtime-insight-advanced">
          <summary>View Runtime signals</summary>

          <ul>
            {insight.supportingSignals.map(
              (signal, index) => (
                <li
                  key={`signal-${index}-${signal}`}
                >
                  {signal}
                </li>
              )
            )}
          </ul>
        </details>
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

function getTopEvidence(insight: RuntimeInsightSynthesis): string[] {
  const refinementEvidence =
    insight.refinement?.evidence ?? [];

  const supportingSignals =
    insight.supportingSignals ?? [];

  return [
    ...refinementEvidence,
    ...supportingSignals,
  ].slice(0, 3);
}