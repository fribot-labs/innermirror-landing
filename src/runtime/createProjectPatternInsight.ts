import type { ProjectAnalysisMemoryEvent } from "../types/projectAnalysisMemory";
import type {
    ProjectPatternInsight,
    ProjectPatternStrength,
    ProjectPatternType,
} from "../types/projectPattern";

export function createProjectPatternInsight(
  events: ProjectAnalysisMemoryEvent[]
): ProjectPatternInsight | null {
  if (events.length < 2) {
    return null;
  }

  const recentEvents = events.slice(0, 6);

  const projectOnlyCount = recentEvents.filter(
    (event) => event.source === "project"
  ).length;

  const combinedCount = recentEvents.filter(
    (event) => event.source === "combined"
  ).length;

  const dominantRepositoryName = findDominantRepositoryName(recentEvents);
  const dominantTags = getDominantTags(recentEvents);

  const type = resolvePatternType({
    recentEvents,
    projectOnlyCount,
    combinedCount,
    dominantRepositoryName,
  });

  const strength = resolvePatternStrength(recentEvents.length);

  return {
    type,
    strength,
    title: buildTitle(type, strength),
    summary: buildSummary({
      type,
      projectOnlyCount,
      combinedCount,
      dominantRepositoryName,
    }),
    eventCount: recentEvents.length,
    projectOnlyCount,
    combinedCount,
    dominantRepositoryName,
    dominantTags,
    suggestedAction: buildSuggestedAction(type),
  };
}

function resolvePatternType({
  recentEvents,
  projectOnlyCount,
  combinedCount,
  dominantRepositoryName,
}: {
  recentEvents: ProjectAnalysisMemoryEvent[];
  projectOnlyCount: number;
  combinedCount: number;
  dominantRepositoryName?: string;
}): ProjectPatternType {
  const repositoryStable =
    dominantRepositoryName !== undefined &&
    recentEvents.every(
      (event) => event.repositoryName === dominantRepositoryName
    );

  if (combinedCount >= 2) {
    return "thought-connected";
  }

  if (projectOnlyCount >= 2) {
    return "project-only";
  }

  if (repositoryStable) {
    return "repository-stable";
  }

  return "mixed";
}

function resolvePatternStrength(
  eventCount: number
): ProjectPatternStrength {
  if (eventCount >= 5) {
    return "clear";
  }

  if (eventCount >= 3) {
    return "forming";
  }

  return "weak";
}

function buildTitle(
  type: ProjectPatternType,
  strength: ProjectPatternStrength
): string {
  if (type === "thought-connected") {
    return "Thinking is becoming connected to project activity";
  }

  if (type === "project-only") {
    return "Project activity is being tracked repeatedly";
  }

  if (type === "repository-stable") {
    return "Project focus is staying consistent";
  }

  if (strength === "clear") {
    return "A project pattern is becoming clear";
  }

  return "A project pattern is forming";
}

function buildSummary({
  type,
  projectOnlyCount,
  combinedCount,
  dominantRepositoryName,
}: {
  type: ProjectPatternType;
  projectOnlyCount: number;
  combinedCount: number;
  dominantRepositoryName?: string;
}): string {
  const repositoryText =
    dominantRepositoryName !== undefined
      ? ` in ${dominantRepositoryName}`
      : "";

  if (type === "thought-connected") {
    return (
      `Recent project activity${repositoryText} includes repeated moments where ` +
      `thinking was connected with project analysis. This suggests the project is ` +
      `starting to connect implementation movement with explicit reasoning.`
    );
  }

  if (type === "project-only") {
    return (
      `Project activity${repositoryText} has been analyzed repeatedly without much ` +
      `written thinking. This suggests the project is being tracked, but the reasoning ` +
      `behind changes may still need to be written down.`
    );
  }

  if (type === "repository-stable") {
    return (
      `Recent activity is consistently focused on the same repository${repositoryText}. ` +
      `This suggests the project context is stable enough for deeper continuity analysis.`
    );
  }

  return (
    `Recent project activity includes ${projectOnlyCount} project-only events and ` +
    `${combinedCount} thought-connected events. The pattern is still mixed.`
  );
}

function buildSuggestedAction(
  type: ProjectPatternType
): string {
  if (type === "thought-connected") {
    return "Review the recent Project Timeline and identify which thought most changed the project direction.";
  }

  if (type === "project-only") {
    return "Add one short thought before the next Project Analyze to make the reasoning behind project movement visible.";
  }

  if (type === "repository-stable") {
    return "Use Project Analyze after the next meaningful commit or pull request to strengthen the project pattern.";
  }

  return "Continue using Project Analyze and Save Thought until a clearer project pattern emerges.";
}

function findDominantRepositoryName(
  events: ProjectAnalysisMemoryEvent[]
): string | undefined {
  const counts = new Map<string, number>();

  events.forEach((event) => {
    if (!event.repositoryName) {
      return;
    }

    counts.set(
      event.repositoryName,
      (counts.get(event.repositoryName) ?? 0) + 1
    );
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
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