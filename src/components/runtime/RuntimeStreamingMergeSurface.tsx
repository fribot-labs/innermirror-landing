import type {
  RuntimeStreamingMergeEvent,
} from "../../types/runtimeStreamingMerge";

type Props = {
  events: RuntimeStreamingMergeEvent[];
  isMerging: boolean;
};

export function RuntimeStreamingMergeSurface({
  events,
  isMerging,
}: Props) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="runtime-streaming-merge">
      <div className="runtime-streaming-merge-header">
        <span className="runtime-streaming-merge-dot" />

        <div>
          <div className="runtime-streaming-merge-eyebrow">
            Runtime Merge
          </div>

          <h2>
            {isMerging
              ? "InnerMirror가 흐름을 연결하고 있습니다."
              : "Project analysis completed."}
          </h2>
        </div>
      </div>

      <div className="runtime-streaming-merge-events">
        {events.map((event, index) => (
          <article
            key={`${event.stage}-${event.createdAt}-${index}`}
            className="runtime-streaming-merge-event"
          >
            <div className="runtime-streaming-merge-event-index">
              {index + 1}
            </div>

            <div>
              <strong>
                {event.title}
              </strong>

              <p>
                {event.message}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}