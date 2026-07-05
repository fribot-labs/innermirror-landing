import type { ProjectAnalysisMemoryEvent } from "../types/projectAnalysisMemory";

const PROJECT_ANALYSIS_MEMORY_KEY =
  "innermirror.projectAnalysisMemory";

export function readProjectAnalysisMemoryEvents(): ProjectAnalysisMemoryEvent[] {
  const rawValue = window.localStorage.getItem(PROJECT_ANALYSIS_MEMORY_KEY);

  if (rawValue === null) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isProjectAnalysisMemoryEvent);
  } catch {
    return [];
  }
}

export function saveProjectAnalysisMemoryEvent(
  event: ProjectAnalysisMemoryEvent
): ProjectAnalysisMemoryEvent[] {
  const currentEvents = readProjectAnalysisMemoryEvents();

  const deduplicatedEvents = currentEvents.filter(
    (currentEvent) => !isDuplicateProjectAnalysisEvent(currentEvent, event)
  );

  const nextEvents = [event, ...deduplicatedEvents].slice(0, 20);

  window.localStorage.setItem(
    PROJECT_ANALYSIS_MEMORY_KEY,
    JSON.stringify(nextEvents)
  );

  return nextEvents;
}

function isDuplicateProjectAnalysisEvent(
  currentEvent: ProjectAnalysisMemoryEvent,
  nextEvent: ProjectAnalysisMemoryEvent
): boolean {
  if (currentEvent.source !== nextEvent.source) {
    return false;
  }

  if (currentEvent.repositoryName !== nextEvent.repositoryName) {
    return false;
  }

  if (currentEvent.commitCount !== nextEvent.commitCount) {
    return false;
  }

  if (currentEvent.pullRequestCount !== nextEvent.pullRequestCount) {
    return false;
  }

  if (currentEvent.summary !== nextEvent.summary) {
    return false;
  }

  const currentTime = new Date(currentEvent.createdAt).getTime();
  const nextTime = new Date(nextEvent.createdAt).getTime();

  const diff = Math.abs(nextTime - currentTime);

  return diff < 5 * 60 * 1000;
}

export function clearProjectAnalysisMemoryEvents() {
  window.localStorage.removeItem(PROJECT_ANALYSIS_MEMORY_KEY);
}

function isProjectAnalysisMemoryEvent(
  value: unknown
): value is ProjectAnalysisMemoryEvent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as ProjectAnalysisMemoryEvent;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.source === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.summary === "string" &&
    typeof candidate.createdAt === "string" &&
    Array.isArray(candidate.tags)
  );
}