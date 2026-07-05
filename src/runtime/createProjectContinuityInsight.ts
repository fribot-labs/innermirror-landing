import type { ProjectAnalysisMemoryEvent } from "../types/projectAnalysisMemory";
import type {
    ProjectContinuityInsight,
    ProjectContinuityStrength,
} from "../types/projectContinuity";

export function createProjectContinuityInsight(
  events: ProjectAnalysisMemoryEvent[]
): ProjectContinuityInsight | null {
  if (events.length === 0) {
    return null;
  }

  const recentEvents = events.slice(0, 5);

  const projectEventCount = recentEvents.filter(
    (event) => event.source === "project"
  ).length;

  const combinedEventCount = recentEvents.filter(
    (event) => event.source === "combined"
  ).length;

  const dominantTags = getDominantTags(recentEvents);

  const strength = resolveContinuityStrength(recentEvents.length);

  const recentRepositoryName = recentEvents[0]?.repositoryName;

  return {
    strength,
    title: buildTitle(strength),
    summary: buildSummary({
      recentEvents,
      projectEventCount,
      combinedEventCount,
      recentRepositoryName,
    }),
    projectEventCount,
    combinedEventCount,
    recentRepositoryName,
    dominantTags,
    suggestedNextAction: buildSuggestedNextAction({
      strength,
      projectEventCount,
      combinedEventCount,
    }),
  };
}

function resolveContinuityStrength(
  eventCount: number
): ProjectContinuityStrength {
  if (eventCount >= 5) {
    return "strong";
  }

  if (eventCount >= 3) {
    return "stable";
  }

  if (eventCount >= 2) {
    return "forming";
  }

  return "weak";
}

function buildTitle(
  strength: ProjectContinuityStrength
): string {
  if (strength === "strong") {
    return "Strong project continuity";
  }

  if (strength === "stable") {
    return "Stable project continuity";
  }

  if (strength === "forming") {
    return "Project continuity is forming";
  }

  return "Project continuity is just starting";
}

function buildSummary({
  recentEvents,
  projectEventCount,
  combinedEventCount,
  recentRepositoryName,
}: {
  recentEvents: ProjectAnalysisMemoryEvent[];
  projectEventCount: number;
  combinedEventCount: number;
  recentRepositoryName?: string;
}): string {
  const repositoryText =
    recentRepositoryName !== undefined
      ? ` in ${recentRepositoryName}`
      : "";

  if (combinedEventCount > 0) {
    return (
      `Recent project activity${repositoryText} includes both project analysis ` +
      `and written thinking. This means the project is starting to connect ` +
      `implementation movement with explicit reasoning.`
    );
  }

  if (projectEventCount >= 2) {
    return (
      `Recent project activity${repositoryText} has been analyzed repeatedly. ` +
      `The project now has enough movement to begin reading continuity over time.`
    );
  }

  return (
    `A project analysis record has started${repositoryText}. Continue using ` +
    `Project Analyze to build a clearer project continuity trail.`
  );
}

function buildSuggestedNextAction({
  strength,
  projectEventCount,
  combinedEventCount,
}: {
  strength: ProjectContinuityStrength;
  projectEventCount: number;
  combinedEventCount: number;
}): string {
  if (combinedEventCount === 0 && projectEventCount > 0) {
    return "Add a short thought next time you run Project Analyze to connect project movement with reasoning.";
  }

  if (strength === "weak") {
    return "Run Project Analyze again after the next meaningful project change.";
  }

  return "Review the recent Project Timeline and identify the most important change in project direction.";
}

function getDominantTags(
  events: ProjectAnalysisMemoryEvent[]
): string[] {
  const counts = new Map<string, number>();

  events.forEach((event) => {
    event.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);
}