import type {
    RuntimeV2RecommendationTimelineItemPresentation,
} from "../../runtime-presentation/runtimeV2RecommendationTimelinePresentationTypes";

type RuntimeV2RecommendationTimelineItemProps = {
  item:
    RuntimeV2RecommendationTimelineItemPresentation;
};

export function RuntimeV2RecommendationTimelineItem({
  item,
}: RuntimeV2RecommendationTimelineItemProps) {
  return (
    <article
      className={[
        "runtime-v2-recommendation-timeline-item",
        item.isCurrent
          ? "runtime-v2-recommendation-timeline-item-current"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="runtime-v2-recommendation-timeline-marker" />

      <div className="runtime-v2-recommendation-timeline-item-content">
        <div className="runtime-v2-recommendation-timeline-item-meta">
          <span>
            {item.statusLabel}
          </span>

          <time dateTime={item.createdAt}>
            {item.createdAtLabel}
          </time>
        </div>

        <strong>
          {item.title}
        </strong>

        <p>
          {item.summary}
        </p>

        <div className="runtime-v2-recommendation-timeline-item-labels">
          <span>
            {item.directionLabel}
          </span>

          <span>
            Priority: {item.priority}
          </span>

          <span>
            Confidence: {item.confidence}
          </span>
        </div>
      </div>
    </article>
  );
}