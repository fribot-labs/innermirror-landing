import type {
    GitHubSnapshot,
    GitHubSnapshotRepository,
} from "../types/githubSnapshot";

const RUNTIME_API_BASE_URL =
  import.meta.env.VITE_RUNTIME_API_BASE_URL ?? "http://localhost:4000";

type FetchGitHubSnapshotResponse = {
  ok: boolean;
  data?: {
    snapshot: GitHubSnapshot;
  };
  error?: {
    code: string;
    message: string;
  };
};

export async function fetchGitHubSnapshot(
  repository: GitHubSnapshotRepository
): Promise<GitHubSnapshot> {
  const githubSessionId = window.localStorage.getItem(
    "innermirror.githubSessionId"
  );

  if (githubSessionId === null) {
    throw new Error("GitHub session is missing. Please connect GitHub again.");
  }

  const url = new URL(`${RUNTIME_API_BASE_URL}/github/snapshot`);

  url.searchParams.set("sessionId", githubSessionId);
  url.searchParams.set("owner", repository.owner);
  url.searchParams.set("name", repository.name);
  url.searchParams.set("defaultBranch", repository.defaultBranch ?? "main");

  const response = await fetch(url.toString());

  if (response.status === 401) {
    window.localStorage.removeItem("innermirror.githubSessionId");

    throw new Error("GitHub session expired. Please connect GitHub again.");
  }

  if (!response.ok) {
    throw new Error(`GitHub snapshot request failed (${response.status}).`);
  }

  const result = (await response.json()) as FetchGitHubSnapshotResponse;

  if (!result.ok || !result.data) {
    throw new Error(
      result.error?.message ?? "GitHub snapshot response was not successful."
    );
  }

  return result.data.snapshot;
}