import type {
    RuntimeMemoryTimelineData,
} from "../../types/runtimeMemoryTimeline";

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

          <h2>
            {data.title}
          </h2>

          <p>
            {data.subtitle}
          </p>
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
                {index === 0
                  ? "현재 reflection"
                  : item.timeLabel}
              </div>

              <div className="runtime-memory-timeline-summary">
                {item.summary}
              </div>

              <div className="runtime-memory-timeline-tags">
                {item.continuityLabel ? (
                  <span>
                    {item.continuityLabel}
                  </span>
                ) : null}

                {item.themeLabel ? (
                  <span>
                    {item.themeLabel}
                  </span>
                ) : null}

                {item.driftLabel ? (
                  <span>
                    {item.driftLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}