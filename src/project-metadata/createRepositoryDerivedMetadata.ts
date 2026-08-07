import type {
    RuntimeProjectIdentity,
} from "../project-identity/runtimeProjectIdentityTypes";

import type {
    RuntimeProjectMetadata,
} from "./runtimeProjectMetadataTypes";

export type CreateRepositoryDerivedMetadataOptions = {
  projectIdentity:
    RuntimeProjectIdentity;

  discoveredAt?:
    string;
};

export function createRepositoryDerivedMetadata({
  projectIdentity,
  discoveredAt =
    new Date().toISOString(),
}: CreateRepositoryDerivedMetadataOptions):
  RuntimeProjectMetadata {
  const normalizedDate =
    new Date(
      discoveredAt
    );

  if (
    Number.isNaN(
      normalizedDate.getTime()
    )
  ) {
    throw new Error(
      "Repository-derived metadata requires a valid discoveredAt value."
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