import type {
    RuntimeProjectContext,
} from "../project-context/runtimeProjectContextTypes";

import type {
    RuntimeProjectMetadata,
} from "../project-metadata/runtimeProjectMetadataTypes";

import type {
    RuntimeProjectIntelligence,
    RuntimeProjectIntelligenceReadiness,
} from "./runtimeProjectIntelligenceTypes";

export type CreateRuntimeProjectIntelligenceInput = {
  metadata:
    RuntimeProjectMetadata;

  context:
    RuntimeProjectContext;

  currentFocus?:
    string | null;

  createdAt?:
    string;
};

export function createRuntimeProjectIntelligence({
  metadata,
  context,
  currentFocus = null,
  createdAt =
    new Date().toISOString(),
}: CreateRuntimeProjectIntelligenceInput):
  RuntimeProjectIntelligence {
  validateProjectIds({
    metadata,
    context,
  });

  const timestamp =
    normalizeCreatedAt(
      createdAt
    );

  const normalizedCurrentFocus =
    normalizeCurrentFocus(
      currentFocus
    );

  const readiness =
    resolveReadiness(
      normalizedCurrentFocus
    );

  const title =
    normalizeTitle(
      metadata.title
    );

  const summary =
    createProjectIntelligenceSummary({
      title,
      difficulty:
        metadata.difficulty,

      estimatedWeeks:
        metadata.estimatedWeeks,

      learningGoal:
        metadata.learningGoal,

      currentFocus:
        normalizedCurrentFocus,

      readiness,
    });

  return {
    intelligenceVersion:
      "v1",

    projectId:
      metadata.projectId,

    title,

    source:
      metadata.source,

    projectKind:
      context.kind,

    difficulty:
      metadata.difficulty,

    estimatedWeeks:
      metadata.estimatedWeeks,

    learningGoal:
      metadata.learningGoal,

    currentFocus:
      normalizedCurrentFocus,

    readiness,

    summary,

    createdAt:
      timestamp,
  };
}

function validateProjectIds({
  metadata,
  context,
}: {
  metadata:
    RuntimeProjectMetadata;

  context:
    RuntimeProjectContext;
}): void {
  const metadataProjectId =
    metadata.projectId.trim();

  const contextProjectId =
    context.projectId.trim();

  if (
    metadataProjectId.length ===
      0 ||
    contextProjectId.length ===
      0
  ) {
    throw new Error(
      "Project Intelligence requires a valid projectId."
    );
  }

  if (
    metadataProjectId !==
    contextProjectId
  ) {
    throw new Error(
      "Project Intelligence requires Metadata and Context to reference the same project."
    );
  }
}

function normalizeCreatedAt(
  createdAt:
    string
): string {
  const normalizedDate =
    new Date(
      createdAt
    );

  if (
    Number.isNaN(
      normalizedDate.getTime()
    )
  ) {
    throw new Error(
      "Project Intelligence requires a valid createdAt value."
    );
  }

  return normalizedDate.toISOString();
}

function normalizeCurrentFocus(
  currentFocus:
    string | null
): string | null {
  if (
    currentFocus ===
    null
  ) {
    return null;
  }

  const normalized =
    currentFocus.trim();

  return normalized.length >
    0
    ? normalized
    : null;
}

function normalizeTitle(
  title:
    string | null
): string {
  if (
    title ===
    null
  ) {
    return "Untitled project";
  }

  const normalized =
    title.trim();

  return normalized.length >
    0
    ? normalized
    : "Untitled project";
}

function resolveReadiness(
  currentFocus:
    string | null
): RuntimeProjectIntelligenceReadiness {
  return currentFocus ===
    null
    ? "unfocused"
    : "ready";
}

function createProjectIntelligenceSummary({
  title,
  difficulty,
  estimatedWeeks,
  learningGoal,
  currentFocus,
  readiness,
}: {
  title:
    string;

  difficulty:
    string | null;

  estimatedWeeks:
    number | null;

  learningGoal:
    string | null;

  currentFocus:
    string | null;

  readiness:
    RuntimeProjectIntelligenceReadiness;
}): string {
  const projectDescription =
    createProjectDescription({
      title,
      difficulty,
      estimatedWeeks,
      learningGoal,
    });

  if (
    readiness ===
      "unfocused" ||
    currentFocus ===
      null
  ) {
    return [
      projectDescription,
      "A current project focus has not been defined yet.",
    ].join(
      " "
    );
  }

  return [
    projectDescription,
    `The current focus is ${currentFocus}.`,
  ].join(
    " "
  );
}

function createProjectDescription({
  title,
  difficulty,
  estimatedWeeks,
  learningGoal,
}: {
  title:
    string;

  difficulty:
    string | null;

  estimatedWeeks:
    number | null;

  learningGoal:
    string | null;
}): string {
  const details:
    string[] = [];

  if (
    difficulty !==
    null
  ) {
    details.push(
      `${difficulty} difficulty`
    );
  }

  if (
    estimatedWeeks !==
    null
  ) {
    details.push(
      `an estimated duration of ${estimatedWeeks} weeks`
    );
  }

  let description:
    string;

  if (
    details.length ===
    0
  ) {
    description =
      `${title} is selected as the current learning project.`;
  } else {
    description =
      `${title} is a learning project with ${joinDetails(
        details
      )}.`;
  }

  if (
    learningGoal ===
    null
  ) {
    return description;
  }

  return [
    description,
    `The learning goal is ${learningGoal}.`,
  ].join(
    " "
  );
}

function joinDetails(
  details:
    string[]
): string {
  if (
    details.length ===
    1
  ) {
    return details[0];
  }

  return `${details[0]} and ${details[1]}`;
}