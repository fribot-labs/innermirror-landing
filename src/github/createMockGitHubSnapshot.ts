import type {
    GitHubSnapshot,
    GitHubSnapshotCommit,
    GitHubSnapshotPullRequest,
    GitHubSnapshotRepository,
} from "../types/githubSnapshot";

/**
 * Creates a mock GitHub Snapshot for the MVP.
 *
 * This function does not call GitHub.
 *
 * It simulates the official MVP behavior:
 *
 * Reflect + GitHub Analyze
 * ↓
 * Recent 10 commits
 * ↓
 * Recent 3 pull requests
 *
 * Real GitHub API integration should replace this function
 * in a later PR without changing the Snapshot contract.
 */
export function createMockGitHubSnapshot(
  repository: GitHubSnapshotRepository
): GitHubSnapshot {
  const capturedAt = new Date().toISOString();

  return {
    repository,
    recentCommits: createMockCommits(repository),
    recentPullRequests: createMockPullRequests(repository),
    capturedAt,
  };
}

function createMockCommits(
  repository: GitHubSnapshotRepository
): GitHubSnapshotCommit[] {
  return Array.from({ length: 10 }, (_, index) => {
    const commitNumber = index + 1;
    const sha = createMockSha(repository, commitNumber);

    return {
      sha,
      message: createMockCommitMessage(commitNumber),
      authorName: "Fribot Learner",
      committedAt: createRelativeIsoTime(commitNumber),
      url: createMockCommitUrl(repository, sha),
    };
  });
}

function createMockPullRequests(
  repository: GitHubSnapshotRepository
): GitHubSnapshotPullRequest[] {
  return [
    {
      id: `${repository.owner}-${repository.name}-pr-1`,
      number: 1,
      title: "Initialize project learning workflow",
      state: "merged",
      authorName: "Fribot Learner",
      createdAt: createRelativeIsoTime(12),
      mergedAt: createRelativeIsoTime(10),
      url: createMockPullRequestUrl(repository, 1),
    },
    {
      id: `${repository.owner}-${repository.name}-pr-2`,
      number: 2,
      title: "Add reflection and project entry surface",
      state: "merged",
      authorName: "Fribot Learner",
      createdAt: createRelativeIsoTime(8),
      mergedAt: createRelativeIsoTime(6),
      url: createMockPullRequestUrl(repository, 2),
    },
    {
      id: `${repository.owner}-${repository.name}-pr-3`,
      number: 3,
      title: "Prepare Runtime Contract V2 context",
      state: "open",
      authorName: "Fribot Learner",
      createdAt: createRelativeIsoTime(3),
      url: createMockPullRequestUrl(repository, 3),
    },
  ];
}

function createMockCommitMessage(commitNumber: number): string {
  const messages = [
    "Initialize PBL project structure",
    "Add GitHub learning entry UI",
    "Define repository selection flow",
    "Create project start panel",
    "Introduce PBL project domain model",
    "Attach reflection to active project",
    "Add project summary surface",
    "Polish project entry UI",
    "Prepare manual GitHub snapshot boundary",
    "Refine Reflect + GitHub Analyze workflow",
  ];

  return messages[commitNumber - 1] ?? `Mock commit ${commitNumber}`;
}

function createMockSha(
  repository: GitHubSnapshotRepository,
  commitNumber: number
): string {
  const seed = `${repository.owner}-${repository.name}-${commitNumber}`;

  return Array.from(seed)
    .map((character) => character.charCodeAt(0).toString(16))
    .join("")
    .slice(0, 12)
    .padEnd(12, "0");
}

function createRelativeIsoTime(hoursAgo: number): string {
  const date = new Date();

  date.setHours(date.getHours() - hoursAgo);

  return date.toISOString();
}

function createMockCommitUrl(
  repository: GitHubSnapshotRepository,
  sha: string
): string {
  return `https://github.com/${repository.owner}/${repository.name}/commit/${sha}`;
}

function createMockPullRequestUrl(
  repository: GitHubSnapshotRepository,
  pullRequestNumber: number
): string {
  return `https://github.com/${repository.owner}/${repository.name}/pull/${pullRequestNumber}`;
}