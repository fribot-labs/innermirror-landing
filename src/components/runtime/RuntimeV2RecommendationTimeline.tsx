import type {
    RuntimeV2RecommendationTimelinePresentation,
} from "../../runtime-presentation/runtimeV2RecommendationTimelinePresentationTypes";

import {
    RuntimeV2RecommendationTimelineItem,
} from "./RuntimeV2RecommendationTimelineItem";

type RuntimeV2RecommendationTimelineProps = {
  presentation:
    RuntimeV2RecommendationTimelinePresentation;
};

export function RuntimeV2RecommendationTimeline({
  presentation,
}: RuntimeV2RecommendationTimelineProps) {
  return (
    <section className="runtime-v2-recommendation-timeline">
      <header className="runtime-v2-recommendation-timeline-header">
        <span>
          Recommendation Timeline
        </span>

        <h4>
          {presentation.headline}
        </h4>

        <p>
          {presentation.summary}
        </p>
      </header>

      <div className="runtime-v2-recommendation-timeline-list">
        {presentation.items.map(
          (item) => (
            <RuntimeV2RecommendationTimelineItem
              key={item.id}
              item={item}
            />
          )
        )}

        {presentation.prediction ? (
          <article className="runtime-v2-recommendation-timeline-prediction">
            <span>
              Likely next direction
            </span>

            <strong>
              {
                presentation.prediction
                  .directionLabel
              }
            </strong>

            <p>
              {
                presentation.prediction
                  .rationale
              }
            </p>

            <small>
              Confidence:{" "}
              {
                presentation.prediction
                  .confidence
              }
            </small>

            {presentation.prediction.conditions.length > 0 ? (
              <ul>
                {presentation.prediction.conditions.map(
                  (condition) => (
                    <li key={condition}>
                      {condition}
                    </li>
                  )
                )}
              </ul>
            ) : null}
          </article>
        ) : null}
      </div>

      <div className="runtime-v2-recommendation-timeline-change">
        <span>
          Latest change
        </span>

        <strong>
          {presentation.change.changeLabel}
        </strong>

        {presentation.change.summary ? (
          <p>
            {presentation.change.summary}
          </p>
        ) : null}
      </div>

      {presentation.evolutionLabel ? (
        <div className="runtime-v2-recommendation-timeline-evolution">
          <span>
            Evolution pattern
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
    </section>
  );
}