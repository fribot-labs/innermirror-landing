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

  const visibleEvents = events.slice(0, DEFAULT_VISIBLE_EVENT_COUNT);
  const hiddenEvents = events.slice(DEFAULT_VISIBLE_EVENT_COUNT);

  return (
    <section className="project-analysis-memory-timeline">
      <div className="project-analysis-memory-timeline-header">
        <div>
          <span>Project Timeline</span>
          <h2>프로젝트 흐름</h2>
          <p>Project Analyze로 생성된 프로젝트 활동 기록입니다.</p>
        </div>

        <button type="button" onClick={onClear}>
          Clear project timeline
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

      <p>{truncateText(event.summary, SUMMARY_MAX_LENGTH)}</p>

      {event.repositoryName ? (
        <small>{event.repositoryName}</small>
      ) : null}

      {event.commitCount !== undefined ||
      event.pullRequestCount !== undefined ? (
        <small>
          {event.commitCount ?? 0} commits ·{" "}
          {event.pullRequestCount ?? 0} pull requests
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
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));

  if (minutes < 1) {
    return "방금 전";
  }

  if (minutes < 60) {
    return `${minutes}분 전`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}시간 전`;
  }

  const days = Math.floor(hours / 24);

  return `${days}일 전`;
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

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}