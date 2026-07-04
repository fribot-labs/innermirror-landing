import type { ProjectAnalysisMemoryEvent } from "../../types/projectAnalysisMemory";

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

  return (
    <section className="project-analysis-memory-timeline">
      <div className="project-analysis-memory-timeline-header">
        <div>
          <span>Project Timeline</span>
          <h2>프로젝트 흐름</h2>
          <p>Project Analyze로 기록된 프로젝트 활동 흐름입니다.</p>
        </div>

        <button type="button" onClick={onClear}>
          모두 지우기
        </button>
      </div>

      <div className="project-analysis-memory-timeline-list">
        {events.map((event) => (
          <article
            key={event.id}
            className="project-analysis-memory-timeline-item"
          >
            <span>{formatRelativeTime(event.createdAt)}</span>

            <h3>{event.title}</h3>

            <p>{event.summary}</p>

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