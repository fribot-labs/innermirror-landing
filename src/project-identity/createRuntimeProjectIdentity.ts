import type {
    GitHubRepositorySummary,
} from "../types/githubLearningEntry";

import type {
    RuntimeProjectIdentity,
    RuntimeProjectKind,
} from "./runtimeProjectIdentityTypes";

export type CreateRuntimeProjectIdentityInput = {
  repository:
    GitHubRepositorySummary;

  kind?:
    RuntimeProjectKind;

  createdAt?:
    string;
};

export function createRuntimeProjectIdentity({
  repository,
  kind = "general",
  createdAt =
    new Date().toISOString(),
}: CreateRuntimeProjectIdentityInput): RuntimeProjectIdentity {
  const owner =
    repository.owner.trim();

  const name =
    repository.name.trim();

  if (
    owner.length === 0 ||
    name.length === 0
  ) {
    throw new Error(
        "A valid GitHub repository is required to create a Runtime Project Identity."
    );
  }

  const fullName =
    normalizeRepositoryFullName({
      owner,
      name,
      fullName:
        repository.fullName,
    });

  const defaultBranch =
    normalizeDefaultBranch(
      repository.defaultBranch
    );

  const htmlUrl =
    normalizeRepositoryHtmlUrl({
      owner,
      name,
      htmlUrl:
        repository.htmlUrl,
    });

  if (
    owner.length === 0 ||
    name.length === 0
  ) {
    throw new Error(
      "A valid GitHub repository is required to create a Runtime Project Identity."
    );
  }

  const normalizedCreatedAt =
    new Date(createdAt);

  if (
    Number.isNaN(
      normalizedCreatedAt.getTime()
    )
  ) {
    throw new Error(
      "Runtime Project Identity requires a valid createdAt value."
    );
  }

  return {
    projectId:
      createGitHubProjectId(
        owner,
        name
      ),

    source:
      "github-repository",

    kind,

    repository: {
      owner,
      name,
      fullName,
      defaultBranch,
      htmlUrl,
    },

    createdAt:
      normalizedCreatedAt.toISOString(),
  };
}

function createGitHubProjectId(
  owner: string,
  name: string
): string {
  return [
    "github",
    normalizeProjectIdSegment(
      owner
    ),
    normalizeProjectIdSegment(
      name
    ),
  ].join(":");
}

function normalizeProjectIdSegment(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

function normalizeRepositoryFullName({
  owner,
  name,
  fullName,
}: {
  owner: string;
  name: string;
  fullName:
    string | undefined;
}): string {
  const normalizedFullName =
    fullName?.trim() ?? "";

  if (
    normalizedFullName.length > 0
  ) {
    return normalizedFullName;
  }

  return `${owner}/${name}`;
}

function normalizeDefaultBranch(
  defaultBranch:
    string | undefined
): string {
  const normalizedDefaultBranch =
    defaultBranch?.trim() ?? "";

  if (
    normalizedDefaultBranch.length > 0
  ) {
    return normalizedDefaultBranch;
  }

  return "main";
}

function normalizeRepositoryHtmlUrl({
  owner,
  name,
  htmlUrl,
}: {
  owner: string;
  name: string;
  htmlUrl:
    string | undefined;
}): string {
  const normalizedHtmlUrl =
    htmlUrl?.trim() ?? "";

  if (
    normalizedHtmlUrl.length > 0
  ) {
    return normalizedHtmlUrl;
  }

  return [
    "https://github.com",
    encodeURIComponent(owner),
    encodeURIComponent(name),
  ].join("/");
}