import type {
    RuntimeProjectIdentity,
} from "../project-identity/runtimeProjectIdentityTypes";

import type {
    RuntimeProjectContext,
} from "./runtimeProjectContextTypes";

export type CreateRuntimeProjectContextInput = {
  projectIdentity:
    RuntimeProjectIdentity;

  createdAt?:
    string;
};

export function createRuntimeProjectContext({
  projectIdentity,
  createdAt =
    new Date().toISOString(),
}: CreateRuntimeProjectContextInput): RuntimeProjectContext {
  const normalizedCreatedAt =
    new Date(createdAt);

  if (
    Number.isNaN(
      normalizedCreatedAt.getTime()
    )
  ) {
    throw new Error(
      "Runtime Project Context requires a valid createdAt value."
    );
  }

  const isPblProject =
    resolveInitialPblProject(
      projectIdentity
    );

  const timestamp =
    normalizedCreatedAt.toISOString();

  return {
    contextVersion:
      "v1",

    projectId:
      projectIdentity.projectId,

    kind:
      isPblProject
        ? "pbl"
        : "general",

    learningMode:
      isPblProject
        ? "project-based-learning"
        : "general-project",

    learningStage:
      "not-defined",

    goal:
      null,

    currentMilestone:
      null,

    source:
      "repository-derived",

    createdAt:
      timestamp,

    updatedAt:
      timestamp,
  };
}

function resolveInitialPblProject(
  projectIdentity:
    RuntimeProjectIdentity
): boolean {
  return (
    projectIdentity.repository.owner
      .trim()
      .toLowerCase() ===
    "fribot-labs"
  );
}