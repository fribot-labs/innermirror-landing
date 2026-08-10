import type {
  RuntimeProjectIdentity,
  RuntimeProjectKind,
  RuntimeProjectRepositoryIdentity,
  RuntimeProjectSource,
} from "./runtimeProjectIdentityTypes";

const RUNTIME_PROJECT_IDENTITY_STORAGE_KEY =
  "innermirror.runtimeProjectIdentity";

/**
 * Runtime Project Identity Store
 *
 * Persists only non-sensitive project identity metadata.
 *
 * This store must never contain:
 *
 * - GitHub access tokens
 * - OAuth provider tokens
 * - Runtime session IDs
 * - private repository contents
 *
 * localStorage is treated as an untrusted persistence boundary.
 * Every restored value is therefore validated before use.
 */

export function saveRuntimeProjectIdentity(
  identity: RuntimeProjectIdentity
): void {
  if (!canUseLocalStorage()) {
    return;
  }

  const validatedIdentity =
    normalizeRuntimeProjectIdentity(
      identity
    );

  window.localStorage.setItem(
    RUNTIME_PROJECT_IDENTITY_STORAGE_KEY,
    JSON.stringify(validatedIdentity)
  );
}

export function loadRuntimeProjectIdentity():
  RuntimeProjectIdentity | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  const storedValue =
    window.localStorage.getItem(
      RUNTIME_PROJECT_IDENTITY_STORAGE_KEY
    );

  if (storedValue === null) {
    return null;
  }

  try {
    const parsedValue =
      JSON.parse(storedValue) as unknown;

    return normalizeRuntimeProjectIdentity(
      parsedValue
    );
  } catch {
    window.localStorage.removeItem(
      RUNTIME_PROJECT_IDENTITY_STORAGE_KEY
    );

    return null;
  }
}

export function clearRuntimeProjectIdentity(): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(
    RUNTIME_PROJECT_IDENTITY_STORAGE_KEY
  );
}

function normalizeRuntimeProjectIdentity(
  value: unknown
): RuntimeProjectIdentity {
  if (!isRecord(value)) {
    throw new Error(
      "Stored Runtime Project Identity must be an object."
    );
  }

  const projectId =
    requireNonEmptyString(
      value.projectId,
      "projectId"
    );

  const source =
    normalizeRuntimeProjectSource(
      value.source
    );

  const kind =
    normalizeRuntimeProjectKind(
      value.kind
    );

  const repository =
    normalizeRuntimeProjectRepositoryIdentity(
      value.repository
    );

  const createdAt =
    normalizeCreatedAt(
      value.createdAt
    );

  const expectedProjectId =
    createExpectedProjectId(
      repository.owner,
      repository.name
    );

  if (
    projectId.toLowerCase() !==
    expectedProjectId
  ) {
    throw new Error(
      "Stored Runtime Project Identity projectId does not match its repository."
    );
  }

  return {
    projectId:
      expectedProjectId,
    source,
    kind,
    repository,
    createdAt,
  };
}

function normalizeRuntimeProjectRepositoryIdentity(
  value: unknown
): RuntimeProjectRepositoryIdentity {
  if (!isRecord(value)) {
    throw new Error(
      "Stored Runtime Project Identity repository must be an object."
    );
  }

  const repositoryId =
    normalizeRepositoryId(
      value.repositoryId
    );

  const owner =
    requireNonEmptyString(
      value.owner,
      "repository.owner"
    );

  const name =
    requireNonEmptyString(
      value.name,
      "repository.name"
    );

  const fullName =
    requireNonEmptyString(
      value.fullName,
      "repository.fullName"
    );

  const defaultBranch =
    requireNonEmptyString(
      value.defaultBranch,
      "repository.defaultBranch"
    );

  const htmlUrl =
    normalizeRepositoryHtmlUrl(
      value.htmlUrl
    );

  const expectedFullName =
    `${owner}/${name}`;

  if (
    fullName.toLowerCase() !==
    expectedFullName.toLowerCase()
  ) {
    throw new Error(
      "Stored Runtime Project Identity repository fullName is inconsistent."
    );
  }

  return {
    repositoryId,
    owner,
    name,
    fullName:
      expectedFullName,
    defaultBranch,
    htmlUrl,
  };
}

function normalizeRuntimeProjectSource(
  value: unknown
): RuntimeProjectSource {
  if (
    value ===
    "github-repository"
  ) {
    return value;
  }

  throw new Error(
    "Stored Runtime Project Identity has an unsupported source."
  );
}

function normalizeRuntimeProjectKind(
  value: unknown
): RuntimeProjectKind {
  if (
    value === "general" ||
    value === "pbl"
  ) {
    return value;
  }

  throw new Error(
    "Stored Runtime Project Identity has an unsupported kind."
  );
}

function normalizeCreatedAt(
  value: unknown
): string {
  const createdAt =
    requireNonEmptyString(
      value,
      "createdAt"
    );

  const timestamp =
    Date.parse(createdAt);

  if (
    Number.isNaN(timestamp)
  ) {
    throw new Error(
      "Stored Runtime Project Identity has an invalid createdAt value."
    );
  }

  return new Date(
    timestamp
  ).toISOString();
}

function normalizeRepositoryHtmlUrl(
  value: unknown
): string {
  const htmlUrl =
    requireNonEmptyString(
      value,
      "repository.htmlUrl"
    );

  let parsedUrl: URL;

  try {
    parsedUrl =
      new URL(htmlUrl);
  } catch {
    throw new Error(
      "Stored Runtime Project Identity has an invalid repository URL."
    );
  }

  if (
    parsedUrl.protocol !==
      "https:" ||
    parsedUrl.hostname.toLowerCase() !==
      "github.com"
  ) {
    throw new Error(
      "Stored Runtime Project Identity repository URL must use https://github.com."
    );
  }

  return parsedUrl.toString();
}

function createExpectedProjectId(
  owner: string,
  name: string
): string {
  return [
    "github",
    owner
      .trim()
      .toLowerCase(),
    name
      .trim()
      .toLowerCase(),
  ].join(":");
}

function requireNonEmptyString(
  value: unknown,
  fieldName: string
): string {
  if (
    typeof value !==
    "string"
  ) {
    throw new Error(
      `Stored Runtime Project Identity ${fieldName} must be a string.`
    );
  }

  const normalizedValue =
    value.trim();

  if (
    normalizedValue.length === 0
  ) {
    throw new Error(
      `Stored Runtime Project Identity ${fieldName} must not be empty.`
    );
  }

  return normalizedValue;
}

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function canUseLocalStorage(): boolean {
  return (
    typeof window !==
      "undefined" &&
    typeof window.localStorage !==
      "undefined"
  );
}

function normalizeRepositoryId(
  value: unknown
): string {
  const repositoryId =
    requireNonEmptyString(
      value,
      "repository.repositoryId"
    );

  if (
    !/^\d+$/.test(
      repositoryId
    )
  ) {
    throw new Error(
      "Stored Runtime Project Identity repository.repositoryId must be a valid GitHub repository ID."
    );
  }

  const numericRepositoryId =
    Number(repositoryId);

  if (
    !Number.isSafeInteger(
      numericRepositoryId
    ) ||
    numericRepositoryId <= 0
  ) {
    throw new Error(
      "Stored Runtime Project Identity repository.repositoryId must be a positive safe integer."
    );
  }

  return repositoryId;
}
