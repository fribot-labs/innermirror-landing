import { useCallback, useEffect, useState } from "react";
import type { GitHubRepositorySummary } from "../types/githubLearningEntry";

const RUNTIME_API_BASE_URL =
  import.meta.env.VITE_RUNTIME_API_BASE_URL ??
  "http://localhost:4000";

type UseGitHubRepositoriesOptions = {
  enabled: boolean;
};

type GitHubRepositoriesResponse = {
  ok: boolean;
  data?: {
    repositories: GitHubRepositorySummary[];
  };
  error?: {
    code: string;
    message: string;
  };
};

export function useGitHubRepositories({
  enabled,
}: UseGitHubRepositoriesOptions) {
  const [repositories, setRepositories] = useState<
    GitHubRepositorySummary[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const githubSessionId = window.localStorage.getItem(
      "innermirror.githubSessionId"
    );

    if (!enabled || githubSessionId === null) {
      setRepositories([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(
        `${RUNTIME_API_BASE_URL}/github/repositories`
      );

      url.searchParams.set("sessionId", githubSessionId);

      const response = await fetch(url.toString());

      if (response.status === 401) {
        window.localStorage.removeItem(
          "innermirror.githubSessionId"
        );

        setRepositories([]);

        setError(
          "GitHub session expired. Please connect GitHub again."
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          `GitHub repositories request failed (${response.status}).`
        );
      }

      const result =
        (await response.json()) as GitHubRepositoriesResponse;

      if (!result.ok || !result.data) {
        throw new Error(
          result.error?.message ??
            "GitHub repositories response was not successful."
        );
      }

      const sortedRepositories = [...result.data.repositories].sort(
        (a, b) =>
          new Date(b.updatedAt ?? 0).getTime() -
          new Date(a.updatedAt ?? 0).getTime()
      );

      setRepositories(sortedRepositories);
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
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setRepositories([]);
      return;
    }

    void refresh();
  }, [enabled, refresh]);

  return {
    repositories,
    isLoading,
    error,
    refresh,
  };
}