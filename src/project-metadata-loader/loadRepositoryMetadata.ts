import type {
  RuntimeProjectIdentity,
} from "../project-identity/runtimeProjectIdentityTypes";

import type {
  RuntimeProjectMetadata,
} from "../project-metadata/runtimeProjectMetadataTypes";

import {
  normalizeRepositoryMetadata,
} from "./normalizeRepositoryMetadata";

import {
  parseRepositoryMetadataManifest,
} from "./parseRepositoryMetadataManifest";

import {
  RUNTIME_GITHUB_SESSION_HEADER,
} from "../github/runtimeGitHubSessionTransport";

const DEFAULT_RUNTIME_API_URL =
  "http://localhost:4000";

const DEFAULT_MANIFEST_PATH =
  "pbl/manifest.json";

export type LoadRepositoryMetadataOptions = {
  githubSessionId:
    string;

  projectIdentity:
    RuntimeProjectIdentity;

  discoveredAt?:
    string;
};

type RuntimeRepositoryFileSuccessResponse = {
  ok:
    true;

  data: {
    path:
      string;

    content:
      string;

    encoding:
      "utf-8";

    sha:
      string | null;
  };
};

type RuntimeRepositoryFileErrorResponse = {
  ok:
    false;

  error: {
    code:
      string;

    message:
      string;
  };
};

type RuntimeRepositoryFileResponse =
  | RuntimeRepositoryFileSuccessResponse
  | RuntimeRepositoryFileErrorResponse;

export class RepositoryMetadataLoadError
  extends Error {
  readonly code:
    string;

  readonly status:
    number;

  constructor({
    code,
    message,
    status,
  }: {
    code:
      string;

    message:
      string;

    status:
      number;
  }) {
    super(
      message
    );

    this.name =
      "RepositoryMetadataLoadError";

    this.code =
      code;

    this.status =
      status;
  }
}

export async function loadRepositoryMetadata({
  githubSessionId,
  projectIdentity,
  discoveredAt,
}: LoadRepositoryMetadataOptions): Promise<
  RuntimeProjectMetadata | null
> {
  const normalizedSessionId =
    githubSessionId.trim();

  if (
    normalizedSessionId.length ===
    0
  ) {
    throw new RepositoryMetadataLoadError({
      code:
        "GITHUB_SESSION_ID_REQUIRED",

      message:
        "A Runtime GitHub session id is required.",

      status:
        400,
    });
  }

  const owner =
    projectIdentity.repository.owner.trim();

  const repository =
    projectIdentity.repository.name.trim();

  const defaultBranch =
    projectIdentity.repository.defaultBranch.trim();

  if (
    owner.length ===
    0
  ) {
    throw new RepositoryMetadataLoadError({
      code:
        "REPOSITORY_OWNER_REQUIRED",

      message:
        "A GitHub repository owner is required.",

      status:
        400,
    });
  }

  if (
    repository.length ===
    0
  ) {
    throw new RepositoryMetadataLoadError({
      code:
        "REPOSITORY_NAME_REQUIRED",

      message:
        "A GitHub repository name is required.",

      status:
        400,
    });
  }

  if (
    defaultBranch.length ===
    0
  ) {
    throw new RepositoryMetadataLoadError({
      code:
        "REPOSITORY_DEFAULT_BRANCH_REQUIRED",

      message:
        "A GitHub repository default branch is required.",

      status:
        400,
    });
  }

  const runtimeApiUrl =
    import.meta.env
      .VITE_RUNTIME_API_URL ??
    DEFAULT_RUNTIME_API_URL;

  const url =
    new URL(
      "/github/repository-file",
      runtimeApiUrl
    );

  url.searchParams.set(
    "owner",
    owner
  );

  url.searchParams.set(
    "repository",
    repository
  );

  url.searchParams.set(
    "path",
    DEFAULT_MANIFEST_PATH
  );

  url.searchParams.set(
    "ref",
    defaultBranch
  );

  let response:
    Response;

  try {
    response =
      await fetch(
        url.toString(),
        {
          method:
            "GET",

          headers: {
            Accept:
              "application/json",

            [RUNTIME_GITHUB_SESSION_HEADER]:
              normalizedSessionId,
          },
        }
      );
  } catch {
    throw new RepositoryMetadataLoadError({
      code:
        "RUNTIME_NETWORK_ERROR",

      message:
        "Unable to reach the private Runtime while loading repository metadata.",

      status:
        502,
    });
  }

  let result:
    RuntimeRepositoryFileResponse;

  try {
    result =
      (await response.json()) as
        RuntimeRepositoryFileResponse;
  } catch {
    throw new RepositoryMetadataLoadError({
      code:
        "RUNTIME_INVALID_RESPONSE",

      message:
        "The private Runtime returned an invalid repository file response.",

      status:
        502,
    });
  }

  if (
    response.status ===
      404 &&
    result.ok ===
      false &&
    result.error.code ===
      "REPOSITORY_FILE_NOT_FOUND"
  ) {
    return null;
  }

  if (
    !response.ok
  ) {
    if (
      result.ok ===
      false
    ) {
      throw new RepositoryMetadataLoadError({
        code:
          result.error.code,

        message:
          result.error.message,

        status:
          response.status,
      });
    }

    throw new RepositoryMetadataLoadError({
      code:
        "RUNTIME_REPOSITORY_FILE_ERROR",

      message:
        `Runtime repository file request failed (${response.status}).`,

      status:
        response.status,
    });
  }

  if (
    result.ok !==
    true
  ) {
    throw new RepositoryMetadataLoadError({
      code:
        "RUNTIME_INVALID_RESPONSE",

      message:
        "The private Runtime returned an invalid repository file response.",

      status:
        502,
    });
  }

  if (
    typeof result.data.path !==
      "string" ||
    typeof result.data.content !==
      "string" ||
    result.data.encoding !==
      "utf-8"
  ) {
    throw new RepositoryMetadataLoadError({
      code:
        "RUNTIME_INVALID_REPOSITORY_FILE",

      message:
        "The Runtime repository file payload is invalid.",

      status:
        502,
    });
  }

  let parsedJson:
    unknown;

  try {
    parsedJson =
      JSON.parse(
        result.data.content
      );
  } catch {
    throw new RepositoryMetadataLoadError({
      code:
        "PBL_MANIFEST_INVALID_JSON",

      message:
        "The PBL manifest contains invalid JSON.",

      status:
        422,
    });
  }

  let manifest;

  try {
    manifest =
      parseRepositoryMetadataManifest(
        parsedJson
      );
  } catch (
    error
  ) {
    throw new RepositoryMetadataLoadError({
      code:
        "PBL_MANIFEST_INVALID",

      message:
        error instanceof Error
          ? error.message
          : "The PBL manifest is invalid.",

      status:
        422,
    });
  }

  try {
    return normalizeRepositoryMetadata({
      projectIdentity,

      manifest,

      discoveredAt,
    });
  } catch (
    error
  ) {
    throw new RepositoryMetadataLoadError({
      code:
        "PROJECT_METADATA_NORMALIZATION_FAILED",

      message:
        error instanceof Error
          ? error.message
          : "Repository metadata normalization failed.",

      status:
        422,
    });
  }
}