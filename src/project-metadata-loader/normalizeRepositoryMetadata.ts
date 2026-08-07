import type {
    RuntimeProjectIdentity,
} from "../project-identity/runtimeProjectIdentityTypes";

import type {
    RuntimeProjectMetadata,
} from "../project-metadata/runtimeProjectMetadataTypes";

import type {
    RepositoryMetadataManifest,
} from "./runtimeMetadataLoaderTypes";

export type NormalizeRepositoryMetadataInput = {
  projectIdentity:
    RuntimeProjectIdentity;

  manifest:
    RepositoryMetadataManifest;

  discoveredAt?:
    string;
};

export function normalizeRepositoryMetadata({
  projectIdentity,
  manifest,
  discoveredAt =
    new Date().toISOString(),
}: NormalizeRepositoryMetadataInput):
  RuntimeProjectMetadata {
  const normalizedDate =
    new Date(discoveredAt);

  if (
    Number.isNaN(
      normalizedDate.getTime()
    )
  ) {
    throw new Error(
      "Repository metadata requires a valid discoveredAt value."
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
      manifest.templateId,

    courseId:
      manifest.courseId,

    title:
      manifest.title ??
      projectIdentity.repository.name,

    difficulty:
      manifest.difficulty,

    estimatedWeeks:
      manifest.estimatedWeeks,

    learningGoal:
      manifest.learningGoal,

    source:
      "pbl-manifest",

    discoveredAt:
      timestamp,

    updatedAt:
      timestamp,
  };
}