import type {
    RepositoryMetadataManifest,
} from "./runtimeMetadataLoaderTypes";

export function parseRepositoryMetadataManifest(
  value: unknown
): RepositoryMetadataManifest {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error(
      "PBL manifest must be an object."
    );
  }

  const manifest =
    value as Record<string, unknown>;

  if (
    manifest.schemaVersion !==
    "v1"
  ) {
    throw new Error(
      "Unsupported PBL manifest schemaVersion."
    );
  }

  return {
    schemaVersion:
      "v1",

    templateId:
      parseNullableString(
        manifest.templateId
      ),

    courseId:
      parseNullableString(
        manifest.courseId
      ),

    title:
      parseNullableString(
        manifest.title
      ),

    difficulty:
      parseNullableString(
        manifest.difficulty
      ),

    estimatedWeeks:
      parseNullableEstimatedWeeks(
        manifest.estimatedWeeks
      ),

    learningGoal:
      parseNullableString(
        manifest.learningGoal
      ),
  };
}

function parseNullableString(
  value: unknown
): string | null {
  if (value === null) {
    return null;
  }

  if (
    typeof value !== "string"
  ) {
    throw new Error(
      "PBL manifest string field is invalid."
    );
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

function parseNullableEstimatedWeeks(
  value: unknown
): number | null {
  if (value === null) {
    return null;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new Error(
      "PBL manifest estimatedWeeks is invalid."
    );
  }

  return value;
}