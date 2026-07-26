import type {
  RuntimeRecommendationPresentation,
} from "../runtimeRecommendationPresentation";

export type RuntimeRecommendationContextProps = {
  presentation:
    RuntimeRecommendationPresentation;
};

export function RuntimeRecommendationContext({
  presentation,
}: RuntimeRecommendationContextProps) {
  return (
    <section
      className={[
        "runtime-recommendation-context",
        `runtime-recommendation-context--${presentation.tone}`,
      ].join(" ")}
      aria-label="Runtime recommendation context"
    >
      <header className="runtime-recommendation-context__header">
        <span className="runtime-recommendation-context__eyebrow">
          Recommendation context
        </span>

        <strong className="runtime-recommendation-context__status">
          {
            presentation
              .integrationStatusLabel
          }
        </strong>
      </header>

      <p className="runtime-recommendation-context__state">
        {
          presentation
            .recommendationStateLabel
        }
      </p>

      <p className="runtime-recommendation-context__message">
        {
          presentation
            .recommendationChangeMessage
        }
      </p>

      <dl className="runtime-recommendation-context__signals">
        <div>
          <dt>
            Confidence
          </dt>

          <dd>
            {
              presentation
                .confidenceLabel
            }
          </dd>
        </div>

        <div>
          <dt>
            Stability
          </dt>

          <dd>
            {
              presentation
                .stabilityLabel
            }
          </dd>
        </div>

        <div>
          <dt>
            Drift
          </dt>

          <dd>
            {
              presentation
                .driftLabel
            }
          </dd>
        </div>
      </dl>

      {presentation.nextFocus !== null ? (
        <p className="runtime-recommendation-context__focus">
          <strong>
            Next focus:
          </strong>{" "}
          {
            presentation
              .nextFocus
          }
        </p>
      ) : null}

      <p className="runtime-recommendation-context__observations">
        {
          presentation
            .observationCountLabel
        }
      </p>
    </section>
  );
}