/**
 * GitHub Snapshot Domain Model
 *
 * PBL Coding Education MVP
 *
 * GitHub Snapshot represents a manually captured
 * development snapshot used by Runtime Contract V2.
 *
 * Snapshot is captured only when the learner presses:
 *
 * Reflect + GitHub Analyze
 *
 * No automatic synchronization is performed.
 */

export type GitHubSnapshotStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

export type GitHubSnapshotCommit = {
  sha: string;

  message: string;

  authorName?: string;

  committedAt?: string;

  url?: string;
};

export type GitHubSnapshotPullRequestStatus =
  | "open"
  | "closed"
  | "merged";

export type GitHubSnapshotPullRequest = {
  id: string;

  number: number;

  title: string;

  state: GitHubSnapshotPullRequestStatus;

  authorName?: string;

  createdAt?: string;

  mergedAt?: string;

  url?: string;
};

export type GitHubSnapshotRepository = {
  owner: string;

  name: string;

  defaultBranch?: string;
};

export type GitHubSnapshot = {
  repository: GitHubSnapshotRepository;

  recentCommits: GitHubSnapshotCommit[];

  recentPullRequests: GitHubSnapshotPullRequest[];

  capturedAt: string;
};

export type GitHubSnapshotState = {
  status: GitHubSnapshotStatus;

  snapshot: GitHubSnapshot | null;

  error: string | null;
};

/**
 * Runtime Contract V2 helper.
 *
 * The Runtime consumes GitHub Snapshot
 * together with:
 *
 * - Reflection
 * - Project
 * - Learning Context
 */
export type RuntimeGitHubSnapshotContext = {
  repositoryOwner: string;

  repositoryName: string;

  recentCommitCount: number;

  recentPullRequestCount: number;

  capturedAt: string;
};

/**
 * Creates an empty GitHub Snapshot state.
 */
export function createEmptyGitHubSnapshotState(): GitHubSnapshotState {
  return {
    status: "idle",
    snapshot: null,
    error: null,
  };
}

/**
 * Creates a lightweight Runtime context
 * from a GitHub Snapshot.
 *
 * This helper prepares Landing data before
 * Runtime Contract V2 submission.
 */
export function createRuntimeGitHubSnapshotContext(
  snapshot: GitHubSnapshot
): RuntimeGitHubSnapshotContext {
  return {
    repositoryOwner: snapshot.repository.owner,

    repositoryName: snapshot.repository.name,

    recentCommitCount: snapshot.recentCommits.length,

    recentPullRequestCount:
      snapshot.recentPullRequests.length,

    capturedAt: snapshot.capturedAt,
  };
}