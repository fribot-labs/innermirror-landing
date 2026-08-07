import type {
    RuntimeProjectIdentity,
} from "../project-identity/runtimeProjectIdentityTypes";

import type {
    RuntimeProjectMetadata,
} from "./runtimeProjectMetadataTypes";

export type CreateRuntimeProjectMetadataInput = {
  projectIdentity:
    RuntimeProjectIdentity;

  discoveredAt?:
    string;
};

export function createRuntimeProjectMetadata({
  projectIdentity,
  discoveredAt =
    new Date().toISOString(),
}: CreateRuntimeProjectMetadataInput):
  RuntimeProjectMetadata {
  const normalizedDate =
    new Date(discoveredAt);

  if (
    Number.isNaN(
      normalizedDate.getTime()
    )
  ) {
    throw new Error(
      "Runtime Project Metadata requires a valid discoveredAt value."
    );
  }

  const timestamp =
    normalizedDate.toISOString();

  return {
    metadataVersion:
      "v1",

    projectId:
      projectIdentity.projectId,

    templateId:
      null,

    courseId:
      null,

    title:
      projectIdentity.repository.name,

    difficulty:
      null,

    estimatedWeeks:
      null,

    learningGoal:
      null,

    source:
      "repository-derived",

    discoveredAt:
      timestamp,

    updatedAt:
      timestamp,
  };
}