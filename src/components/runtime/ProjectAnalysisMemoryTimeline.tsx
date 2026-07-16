import type { ProjectAnalysisMemoryEvent } from "../../types/projectAnalysisMemory";

const DEFAULT_VISIBLE_EVENT_COUNT = 3;
const SUMMARY_MAX_LENGTH = 280;

type ProjectAnalysisMemoryTimelineProps = {
  events: ProjectAnalysisMemoryEvent[];
  onClear: () => void;
};

export function ProjectAnalysisMemoryTimeline({
  events,
  onClear,
}: ProjectAnalysisMemoryTimelineProps) {
  if (events.length === 0) {
    return null;
  }

  const visibleEvents = events.slice(
    0,
    DEFAULT_VISIBLE_EVENT_COUNT
  );

  const hiddenEvents = events.slice(
    DEFAULT_VISIBLE_EVENT_COUNT
  );

  return (
    <section className="project-analysis-memory-timeline">
      <div className="project-analysis-memory-timeline-header">
        <div>
          <span>Project Timeline</span>

          <h2>Project Activity</h2>

          <p>
            Project Activity arranged by analysis time.
          </p>
        </div>

        <button type="button" onClick={onClear}>
          Clear timeline
        </button>
      </div>

      <div className="project-analysis-memory-timeline-list">
        {visibleEvents.map((event) => (
          <ProjectAnalysisMemoryTimelineItem
            key={event.id}
            event={event}
          />
        ))}
      </div>

      {hiddenEvents.length > 0 ? (
        <details className="project-analysis-memory-more">
          <summary>
            Show {hiddenEvents.length} older project events
          </summary>

          <div className="project-analysis-memory-timeline-list">
            {hiddenEvents.map((event) => (
              <ProjectAnalysisMemoryTimelineItem
                key={event.id}
                event={event}
              />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

type ProjectAnalysisMemoryTimelineItemProps = {
  event: ProjectAnalysisMemoryEvent;
};

function ProjectAnalysisMemoryTimelineItem({
  event,
}: ProjectAnalysisMemoryTimelineItemProps) {
  return (
    <article className="project-analysis-memory-timeline-item">
      <div className="project-analysis-memory-meta-row">
        <span>{formatRelativeTime(event.createdAt)}</span>

        <span className="project-analysis-memory-source">
          {formatSourceLabel(event.source)}
        </span>
      </div>

      <h3>{event.title}</h3>

      <p>
        {truncateText(
          event.summary,
          SUMMARY_MAX_LENGTH
        )}
      </p>

      {event.repositoryName ? (
        <small className="project-analysis-memory-context">
          {event.repositoryName}

          {event.commitCount !== undefined ||
          event.pullRequestCount !== undefined
            ? ` · ${event.commitCount ?? 0} commits · ${
                event.pullRequestCount ?? 0
              } pull requests`
            : ""}
        </small>
      ) : null}

      {event.tags.length > 0 ? (
        <div className="project-analysis-memory-tags">
          {event.tags.map((tag) => (
            <span key={`${event.id}-${tag}`}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function formatRelativeTime(value: string): string {
  const diff =
    Date.now() - new Date(value).getTime();

  const minutes = Math.max(
    0,
    Math.floor(diff / 60000)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

function formatSourceLabel(
  source: ProjectAnalysisMemoryEvent["source"]
): string {
  if (source === "combined") {
    return "Thought + Project";
  }

  if (source === "project") {
    return "Project";
  }

  return "Thought";
}

function truncateText(
  value: string,
  maxLength: number
): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}