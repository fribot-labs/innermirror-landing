/**
 * GitHub Learning Entry
 *
 * Phase 1
 * GitHub Learning Entry
 *
 * These types belong to the Landing repository.
 *
 * They describe only the user-facing GitHub learning workflow.
 *
 * Runtime intelligence belongs to
 * innermirror-runtime-private.
 */

export type GitHubConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/**
 * Lightweight GitHub repository information
 * used by the Landing UI.
 */
export type GitHubRepositorySummary = {
  owner: string;
  name: string;
  defaultBranch?: string;

  fullName?: string;
  private?: boolean;
  htmlUrl?: string;
  updatedAt?: string;
};

/**
 * Temporary Landing-side project model.
 *
 * This represents the current project selected
 * by the learner before Runtime analysis begins.
 *
 * This is NOT the Runtime Project model.
 */
export type LandingProjectDraft = {
  projectId: string;

  name: string;

  repositoryOwner: string;

  repositoryName: string;

  defaultBranch?: string;

  currentStep: string;

  createdAt?: string;
};

/**
 * Landing state for GitHub Learning Entry.
 */
export type GitHubLearningEntryState = {
  connectionState: GitHubConnectionState;

  repositories: GitHubRepositorySummary[];

  selectedRepository: GitHubRepositorySummary | null;

  projectDraft: LandingProjectDraft | null;
};

/**
 * MVP helper factory.
 *
 * Creates a default project draft after
 * the learner selects a repository.
 */
export function createLandingProjectDraft(
  repository: GitHubRepositorySummary
): LandingProjectDraft {
  return {
    projectId: crypto.randomUUID(),

    name: repository.name,

    repositoryOwner: repository.owner,

    repositoryName: repository.name,

    defaultBranch: repository.defaultBranch ?? "main",

    currentStep: "Project Initialization",

    createdAt: new Date().toISOString(),
  };
}