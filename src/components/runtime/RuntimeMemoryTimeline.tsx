import type {
  RuntimeMemoryFlowState,
  RuntimeMemoryTimelineData,
} from "../../types/runtimeMemoryTimeline";

const MEMORY_TEXT_MAX_LENGTH = 140;

type Props = {
  data: RuntimeMemoryTimelineData;
};

export function RuntimeMemoryTimeline({
  data,
}: Props) {
  if (!data.visible) {
    return null;
  }

  return (
    <section className="runtime-memory-timeline">
      <div className="runtime-memory-timeline-header">
        <div>
          <div className="runtime-memory-timeline-eyebrow">
            Memory Timeline
          </div>

          <h2>{data.title}</h2>

          <p>{data.subtitle}</p>
        </div>
      </div>

      <div className="runtime-memory-timeline-list">
        {data.items.map((item, index) => (
          <article
            key={item.id}
            className="runtime-memory-timeline-item"
          >
            <div className="runtime-memory-timeline-marker">
              <span />
            </div>

            <div className="runtime-memory-timeline-body">
              <div className="runtime-memory-timeline-meta">
                <span className="runtime-memory-timeline-time">
                  {index === 0
                    ? "Current reflection"
                    : item.timeLabel}
                </span>

                {item.flowState ? (
                  <span className="runtime-memory-timeline-chip">
                    {formatFlowState(item.flowState)}
                  </span>
                ) : null}

                {item.topicLabel ? (
                  <span className="runtime-memory-timeline-chip">
                    {item.topicLabel}
                  </span>
                ) : null}
              </div>

              <p className="runtime-memory-timeline-summary">
                {truncateMemoryText(
                  item.summary,
                  MEMORY_TEXT_MAX_LENGTH
                )}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function truncateMemoryText(
  value: string,
  maxLength: number
): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value
    .slice(0, maxLength)
    .trim()}...`;
}

function formatFlowState(
  state: RuntimeMemoryFlowState
): string {
  if (state === "forming") {
    return "Forming";
  }

  if (state === "deepening") {
    return "Deepening";
  }

  if (state === "branching") {
    return "Branching";
  }

  if (state === "returning") {
    return "Returning";
  }

  return "Stable";
}