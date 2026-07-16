import type {
  RuntimeMemoryFlowState,
  RuntimeMemoryTimelineData,
  RuntimeMemoryTimelineItem,
} from "../../types/runtimeMemoryTimeline";

import {
  RUNTIME_TERMINOLOGY,
} from "../../constants/runtimeTerminology";

const DEFAULT_VISIBLE_MEMORY_COUNT = 3;

type Props = {
  data: RuntimeMemoryTimelineData;
};

type RuntimeMemoryTimelineItemProps = {
  item: RuntimeMemoryTimelineItem;
  isCurrent: boolean;
};

export function RuntimeMemoryTimeline({
  data,
}: Props) {
  if (!data.visible || data.items.length === 0) {
    return null;
  }

  const visibleItems = data.items.slice(
    0,
    DEFAULT_VISIBLE_MEMORY_COUNT
  );

  const hiddenItems = data.items.slice(
    DEFAULT_VISIBLE_MEMORY_COUNT
  );

  return (
    <section className="runtime-memory-timeline">
      <div className="runtime-memory-timeline-header">
        <div>
          <div className="runtime-memory-timeline-eyebrow">
            {RUNTIME_TERMINOLOGY.reflectionMemory}
          </div>

          <h2>{data.title}</h2>

          <p>{data.subtitle}</p>
        </div>
      </div>

      <div className="runtime-memory-timeline-list">
        {visibleItems.map((item, index) => (
          <RuntimeMemoryTimelineEntry
            key={item.id}
            item={item}
            isCurrent={index === 0}
          />
        ))}
      </div>

      {hiddenItems.length > 0 ? (
        <details className="runtime-memory-timeline-more">
          <summary>
            Show {hiddenItems.length} older memory records
          </summary>

          <div className="runtime-memory-timeline-list runtime-memory-timeline-list-older">
            {hiddenItems.map((item) => (
              <RuntimeMemoryTimelineEntry
                key={item.id}
                item={item}
                isCurrent={false}
              />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

function RuntimeMemoryTimelineEntry({
  item,
  isCurrent,
}: RuntimeMemoryTimelineItemProps) {
  return (
    <article className="runtime-memory-timeline-item">
      <div className="runtime-memory-timeline-marker">
        <span />
      </div>

      <div className="runtime-memory-timeline-body">
        <div className="runtime-memory-timeline-meta">
          {isCurrent
            ? RUNTIME_TERMINOLOGY.currentReflection
            : formatRelativeTime(item.createdAt)}
        </div>

        <p className="runtime-memory-timeline-summary">
          {item.summary}
        </p>

        {item.flowState || item.topicLabel ? (
          <div className="runtime-memory-timeline-tags">
            {item.flowState ? (
              <span>
                {formatFlowState(item.flowState)}
              </span>
            ) : null}

            {item.topicLabel ? (
              <span>
                {RUNTIME_TERMINOLOGY.origin}:{" "}
                {item.topicLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function formatFlowState(
  value: RuntimeMemoryFlowState
): string {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function formatRelativeTime(
  value: string
): string {
  const timestamp =
    new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return "";
  }

  const elapsedMilliseconds =
    Date.now() - timestamp;

  const elapsedMinutes =
    Math.max(
      0,
      Math.floor(
        elapsedMilliseconds / 60_000
      )
    );

  if (elapsedMinutes < 1) {
    return "Just now";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} ${
      elapsedMinutes === 1
        ? "minute"
        : "minutes"
    } ago`;
  }

  const elapsedHours =
    Math.floor(
      elapsedMinutes / 60
    );

  if (elapsedHours < 24) {
    return `${elapsedHours} ${
      elapsedHours === 1
        ? "hour"
        : "hours"
    } ago`;
  }

  const elapsedDays =
    Math.floor(
      elapsedHours / 24
    );

  return `${elapsedDays} ${
    elapsedDays === 1
      ? "day"
      : "days"
  } ago`;
}