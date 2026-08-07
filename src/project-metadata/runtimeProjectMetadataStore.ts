import type {
    RuntimeProjectMetadata,
    RuntimeProjectMetadataSource,
} from "./runtimeProjectMetadataTypes";

const RUNTIME_PROJECT_METADATA_STORAGE_KEY =
  "innermirror.runtimeProjectMetadata";

export function saveRuntimeProjectMetadata(
  metadata: RuntimeProjectMetadata
): void {
  if (!canUseLocalStorage()) {
    return;
  }

  if (
    !isRuntimeProjectMetadata(
      metadata
    )
  ) {
    throw new Error(
      "Runtime Project Metadata is invalid."
    );
  }

  window.localStorage.setItem(
    RUNTIME_PROJECT_METADATA_STORAGE_KEY,
    JSON.stringify(metadata)
  );
}

export function loadRuntimeProjectMetadata():
  RuntimeProjectMetadata | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  const storedValue =
    window.localStorage.getItem(
      RUNTIME_PROJECT_METADATA_STORAGE_KEY
    );

  if (storedValue === null) {
    return null;
  }

  try {
    const parsedValue =
      JSON.parse(storedValue) as unknown;

    if (
      !isRuntimeProjectMetadata(
        parsedValue
      )
    ) {
      window.localStorage.removeItem(
        RUNTIME_PROJECT_METADATA_STORAGE_KEY
      );

      return null;
    }

    return parsedValue;
  } catch {
    window.localStorage.removeItem(
      RUNTIME_PROJECT_METADATA_STORAGE_KEY
    );

    return null;
  }
}

export function clearRuntimeProjectMetadata():
  void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(
    RUNTIME_PROJECT_METADATA_STORAGE_KEY
  );
}

function isRuntimeProjectMetadata(
  value: unknown
): value is RuntimeProjectMetadata {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const metadata =
    value as Record<string, unknown>;

  return (
    metadata.metadataVersion ===
      "v1" &&

    isNonEmptyString(
      metadata.projectId
    ) &&

    isNullableString(
      metadata.templateId
    ) &&

    isNullableString(
      metadata.courseId
    ) &&

    isNullableString(
      metadata.title
    ) &&

    isNullableString(
      metadata.difficulty
    ) &&

    isNullableEstimatedWeeks(
      metadata.estimatedWeeks
    ) &&

    isNullableString(
      metadata.learningGoal
    ) &&

    isRuntimeProjectMetadataSource(
      metadata.source
    ) &&

    isValidIsoDateString(
      metadata.discoveredAt
    ) &&

    isValidIsoDateString(
      metadata.updatedAt
    )
  );
}

function isRuntimeProjectMetadataSource(
  value: unknown
): value is RuntimeProjectMetadataSource {
  return (
    value ===
      "repository-derived" ||
    value ===
      "pbl-manifest"
  );
}

function isNullableString(
  value: unknown
): value is string | null {
  return (
    value === null ||
    typeof value === "string"
  );
}

function isNonEmptyString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function isNullableEstimatedWeeks(
  value: unknown
): value is number | null {
  if (value === null) {
    return true;
  }

  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function isValidIsoDateString(
  value: unknown
): value is string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return false;
  }

  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return false;
  }

  return (
    parsedDate.toISOString() ===
    value
  );
}

function canUseLocalStorage():
  boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !==
      "undefined"
  );
}