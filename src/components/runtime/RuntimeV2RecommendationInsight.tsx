import type {
    RuntimeV2RecommendationInsightPresentation,
} from "../../runtime-presentation/runtimeV2RecommendationInsightPresentationTypes";

type RuntimeV2RecommendationInsightProps = {
  presentation:
    RuntimeV2RecommendationInsightPresentation;
};

/**
 * Presents Runtime-generated Recommendation Insight.
 *
 * This component does not:
 *
 * - resolve Recommendation Insight patterns
 * - calculate confidence
 * - analyze Runtime Evidence
 * - create supporting reasons
 * - modify the Runtime response
 *
 * It only renders the Landing presentation model.
 */
export function RuntimeV2RecommendationInsight({
  presentation,
}: RuntimeV2RecommendationInsightProps) {
  const toneClassName =
    `runtime-v2-recommendation-insight-${presentation.tone}`;

  return (
    <section
      className={[
        "runtime-v2-recommendation-insight",
        toneClassName,
      ].join(" ")}
      aria-labelledby="runtime-v2-recommendation-insight-title"
    >
      <header className="runtime-v2-recommendation-insight-header">
        <span className="runtime-v2-recommendation-insight-eyebrow">
          Recommendation Insight
        </span>

        <h3 id="runtime-v2-recommendation-insight-title">
          {presentation.headline}
        </h3>

        <p>
          {presentation.summary}
        </p>
      </header>

      <section
        className="runtime-v2-recommendation-insight-primary"
        aria-labelledby="runtime-v2-recommendation-insight-primary-title"
      >
        <span
          id="runtime-v2-recommendation-insight-primary-title"
          className="runtime-v2-recommendation-insight-section-label"
        >
          Key Insight
        </span>

        <strong>
          {presentation.keyInsight}
        </strong>
      </section>

      {presentation.supportingReasons.length > 0 ? (
        <section
          className="runtime-v2-recommendation-insight-reasons"
          aria-labelledby="runtime-v2-recommendation-insight-reasons-title"
        >
          <span
            id="runtime-v2-recommendation-insight-reasons-title"
            className="runtime-v2-recommendation-insight-section-label"
          >
            Supporting Reasons
          </span>

          <ul>
            {presentation.supportingReasons.map(
              (
                reason,
                index
              ) => (
                <li
                  key={`runtime-v2-recommendation-insight-reason-${index}-${reason}`}
                >
                  {reason}
                </li>
              )
            )}
          </ul>
        </section>
      ) : null}

      <footer className="runtime-v2-recommendation-insight-meta">
        <span>
          Pattern: {presentation.patternLabel}
        </span>

        <span>
          {presentation.confidenceLabel}
        </span>

        <span>
          Evidence: {presentation.evidenceCount}
        </span>

        <time
          dateTime={presentation.generatedAt}
        >
          {presentation.generatedAtLabel}
        </time>
      </footer>
    </section>
  );
}