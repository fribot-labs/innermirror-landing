import type {
  RuntimeV2RecommendationPresentation,
} from "../../runtime-presentation/runtimeV2RecommendationPresentationTypes";

import type {
  RuntimeV2RecommendationTimelinePresentation,
} from "../../runtime-presentation/runtimeV2RecommendationTimelinePresentationTypes";

import {
  RuntimeV2RecommendationTimeline,
} from "./RuntimeV2RecommendationTimeline";

type RuntimeV2RecommendationPanelProps = {
  presentation:
    RuntimeV2RecommendationPresentation;

  timelinePresentation:
    RuntimeV2RecommendationTimelinePresentation | null;
};

export function RuntimeV2RecommendationPanel({
  presentation,
  timelinePresentation,
}: RuntimeV2RecommendationPanelProps) {
  return (
    <section className="runtime-v2-recommendation-panel">
      <div className="runtime-v2-recommendation-header">
        <span>
          Runtime Recommendation
        </span>

        <h3>
          {presentation.title}
        </h3>

        <p>
          {presentation.summary}
        </p>
      </div>

      <div className="runtime-v2-recommendation-meta">
        <span>
          Direction: {presentation.directionLabel}
        </span>

        <span>
          Priority: {presentation.priority}
        </span>

        <span>
          Confidence: {presentation.confidence}
        </span>
      </div>

      <div className="runtime-v2-recommendation-action">
        <span>
          Recommended action
        </span>

        <strong>
          {presentation.action}
        </strong>

        <p>
          {presentation.rationale}
        </p>
      </div>

      {presentation.steps.length > 0 ? (
        <ol className="runtime-v2-recommendation-steps">
          {presentation.steps.map(
            (step) => (
              <li key={step}>
                {step}
              </li>
            )
          )}
        </ol>
      ) : null}

      <div className="runtime-v2-recommendation-status">
        <p>
          <strong>Change:</strong>{" "}
          {presentation.changeLabel}
        </p>

        <p>
          <strong>Observation:</strong>{" "}
          {presentation.alignmentLabel}
        </p>

        {presentation.observationSummary ? (
          <p>
            {presentation.observationSummary}
          </p>
        ) : null}
      </div>

      {presentation.evolutionLabel ? (
        <div className="runtime-v2-recommendation-evolution">
          <span>
            Recommendation evolution
          </span>

          <strong>
            {presentation.evolutionLabel}
          </strong>

          {presentation.evolutionSummary ? (
            <p>
              {presentation.evolutionSummary}
            </p>
          ) : null}
        </div>
      ) : null}

      {timelinePresentation ? (
        <details className="runtime-v2-recommendation-timeline-details">
          <summary>
            View Recommendation Timeline
          </summary>

          <RuntimeV2RecommendationTimeline
            presentation={
              timelinePresentation
            }
          />
        </details>
      ) : null}

      {presentation.predictedDirectionLabel ? (
        <div className="runtime-v2-recommendation-prediction">
          <span>
            Likely next direction
          </span>

          <strong>
            {presentation.predictedDirectionLabel}
          </strong>

          {presentation.predictionRationale ? (
            <p>
              {presentation.predictionRationale}
            </p>
          ) : null}

          {presentation.predictionConditions.length > 0 ? (
            <ul>
              {presentation.predictionConditions.map(
                (condition) => (
                  <li key={condition}>
                    {condition}
                  </li>
                )
              )}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}