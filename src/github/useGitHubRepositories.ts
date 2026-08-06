import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  GitHubRepositorySummary,
} from "../types/githubLearningEntry";

const RUNTIME_API_BASE_URL =
  import.meta.env.VITE_RUNTIME_API_BASE_URL ??
  "http://localhost:4000";

type UseGitHubRepositoriesOptions = {
  enabled: boolean;
  githubSessionId: string | null;
};

type GitHubRepositoriesResponse = {
  ok: boolean;

  data?: {
    repositories:
      GitHubRepositorySummary[];
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

        url.searchParams.set(
          "sessionId",
          normalizedSessionId
        );

        const response =
          await fetch(
            url.toString()
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

        const sortedRepositories =
          [
            ...result.data.repositories,
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