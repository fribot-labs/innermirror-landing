import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  GitHubRepositorySummary,
} from "../types/githubLearningEntry";

import {
  RUNTIME_GITHUB_SESSION_HEADER,
} from "./runtimeGitHubSessionTransport";

const RUNTIME_API_BASE_URL =
  import.meta.env.VITE_RUNTIME_API_URL ??
  "http://localhost:4000";

type UseGitHubRepositoriesOptions = {
  enabled: boolean;
  githubSessionId: string | null;
};

type RuntimeGitHubRepository = {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
  htmlUrl: string;
  updatedAt: string;
};

type GitHubRepositoriesResponse = {
  ok: boolean;

  data?: {
    repositories:
      RuntimeGitHubRepository[];
  };

  error?: {
    code: string;
    message: string;
  };
};

export function useGitHubRepositories({
  enabled,
  githubSessionId,
}: UseGitHubRepositoriesOptions) {
  const [
    repositories,
    setRepositories,
  ] = useState<
    GitHubRepositorySummary[]
  >([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const refresh =
    useCallback(async () => {
      const normalizedSessionId =
        githubSessionId?.trim() ?? "";

      if (
        !enabled ||
        normalizedSessionId.length === 0
      ) {
        setRepositories([]);
        setIsLoading(false);
        setError(null);

        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const url = new URL(
          `${RUNTIME_API_BASE_URL}/github/repositories`
        );

        const response =
          await fetch(
            url.toString(),
            {
              headers: {
                [RUNTIME_GITHUB_SESSION_HEADER]:
                  normalizedSessionId,
              },
            }
          );

        if (
          response.status === 401
        ) {
          setRepositories([]);

          setError(
            "GitHub session expired. Reconnect Runtime to continue."
          );

          return;
        }

        if (!response.ok) {
          throw new Error(
            `GitHub repositories request failed (${response.status}).`
          );
        }

        const result =
          (await response.json()) as
            GitHubRepositoriesResponse;

        if (
          !result.ok ||
          !result.data
        ) {
          throw new Error(
            result.error?.message ??
              "GitHub repositories response was not successful."
          );
        }

        const normalizedRepositories =
          result.data.repositories.map(
            toGitHubRepositorySummary
          );

        const sortedRepositories =
          [
            ...normalizedRepositories,
          ].sort(
            (a, b) =>
              getRepositoryUpdatedTimestamp(
                b
              ) -
              getRepositoryUpdatedTimestamp(
                a
              )
          );

        setRepositories(
          sortedRepositories
        );
      } catch (error) {
        setRepositories([]);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load GitHub repositories."
        );
      } finally {
        setIsLoading(false);
      }
    }, [
      enabled,
      githubSessionId,
    ]);

  useEffect(() => {
    if (
      !enabled ||
      githubSessionId === null ||
      githubSessionId.trim()
        .length === 0
    ) {
      setRepositories([]);
      setIsLoading(false);
      setError(null);

      return;
    }

    void refresh();
  }, [
    enabled,
    githubSessionId,
    refresh,
  ]);

  return {
    repositories,
    isLoading,
    error,
    refresh,
  };
}

function getRepositoryUpdatedTimestamp(
  repository:
    GitHubRepositorySummary
): number {
  if (
    typeof repository.updatedAt !==
      "string" ||
    repository.updatedAt.trim()
      .length === 0
  ) {
    return 0;
  }

  const timestamp =
    Date.parse(
      repository.updatedAt
    );

  return Number.isNaN(
    timestamp
  )
    ? 0
    : timestamp;
}

function toGitHubRepositorySummary(
  repository:
    RuntimeGitHubRepository
): GitHubRepositorySummary {
  if (
    !Number.isSafeInteger(
      repository.id
    ) ||
    repository.id <= 0
  ) {
    throw new Error(
      "GitHub repository response is missing a stable repository identity."
    );
  }

  const owner =
    repository.owner.trim();

  const name =
    repository.name.trim();

  if (
    owner.length === 0 ||
    name.length === 0
  ) {
    throw new Error(
      "GitHub repository response included invalid repository metadata."
    );
  }

  return {
    repositoryId:
      String(repository.id),

    owner,
    name,

    fullName:
      repository.fullName,

    defaultBranch:
      repository.defaultBranch,

    private:
      repository.private,

    htmlUrl:
      repository.htmlUrl,

    updatedAt:
      repository.updatedAt,
  };
}
