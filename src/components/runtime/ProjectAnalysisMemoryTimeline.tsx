import { useState } from "react";
import type { ProjectAnalysisMemoryEvent } from "../../types/projectAnalysisMemory";

const DEFAULT_VISIBLE_EVENT_COUNT = 5;
const SUMMARY_MAX_LENGTH = 280;

type ProjectAnalysisMemoryTimelineProps = {
  events: ProjectAnalysisMemoryEvent[];
  onClear: () => void;
};

export function ProjectAnalysisMemoryTimeline({
  events,
  onClear,
}: ProjectAnalysisMemoryTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (events.length === 0) {
    return null;
  }

  const visibleEvents = isExpanded
    ? events
    : events.slice(0, DEFAULT_VISIBLE_EVENT_COUNT);

  const hiddenEventCount = Math.max(
    0,
    events.length - visibleEvents.length
  );

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
          <article
            key={event.id}
            className="project-analysis-memory-timeline-item"
          >
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

            <div className="project-analysis-memory-tags">
              {event.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {hiddenEventCount > 0 ? (
        <button
          type="button"
          className="project-analysis-memory-expand-button"
          onClick={() => setIsExpanded(true)}
        >
          Show {hiddenEventCount} more project events
        </button>
      ) : null}

      {isExpanded && events.length > DEFAULT_VISIBLE_EVENT_COUNT ? (
        <button
          type="button"
          className="project-analysis-memory-expand-button"
          onClick={() => setIsExpanded(false)}
        >
          Show fewer project events
        </button>
      ) : null}
    </section>
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