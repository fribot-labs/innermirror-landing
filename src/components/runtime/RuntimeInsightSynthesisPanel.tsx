import type { RuntimeInsightSynthesis } from "../../types/runtimeContractV2";

type RuntimeInsightSynthesisPanelProps = {
  insight: RuntimeInsightSynthesis;
};

export function RuntimeInsightSynthesisPanel({
  insight,
}: RuntimeInsightSynthesisPanelProps) {
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