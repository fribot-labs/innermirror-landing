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

  const nextEvents = [event, ...currentEvents].slice(0, 30);

  window.localStorage.setItem(
    PROJECT_ANALYSIS_MEMORY_KEY,
    JSON.stringify(nextEvents)
  );

  return nextEvents;
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