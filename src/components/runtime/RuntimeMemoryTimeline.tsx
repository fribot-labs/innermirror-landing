import type {
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
                <span>
                  {index === 0
                    ? "현재 reflection"
                    : item.timeLabel}
                </span>

                {item.continuityLabel ? (
                  <span>{item.continuityLabel}</span>
                ) : null}

                {item.themeLabel ? (
                  <span>{item.themeLabel}</span>
                ) : null}

                {item.driftLabel ? (
                  <span>{item.driftLabel}</span>
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