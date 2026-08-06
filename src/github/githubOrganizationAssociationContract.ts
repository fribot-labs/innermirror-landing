import type {
    GitHubRepositorySummary,
} from "../types/githubLearningEntry";

export type VerifyGitHubOrganizationRequest = {
  organizationLogin: string;
};

export type VerifyGitHubOrganizationSuccessResponse = {
  ok: true;

  organization: {
    id: number;
    login: string;
    membershipState: "active";
    role: "admin" | "member";
  };

  authenticatedUser: {
    id: number;
    login: string;
  };

  repositories: GitHubRepositorySummary[];
};

export type VerifyGitHubOrganizationErrorCode =
  | "INVALID_ORGANIZATION_LOGIN"
  | "INVALID_GITHUB_SESSION_ID"
  | "GITHUB_SESSION_EXPIRED"
  | "GITHUB_AUTHENTICATED_USER_FETCH_FAILED"
  | "ORGANIZATION_NOT_AFFILIATED"
  | "ORGANIZATION_MEMBERSHIP_PENDING"
  | "ORGANIZATION_ACCESS_BLOCKED"
  | "ORGANIZATION_VERIFICATION_UNAVAILABLE"
  | "ORGANIZATION_REPOSITORY_FETCH_FAILED";

export type VerifyGitHubOrganizationErrorResponse = {
  ok: false;

  error: {
    code: VerifyGitHubOrganizationErrorCode;
    message: string;
    recoverable: boolean;
    status?: number;
  };
};

export type VerifyGitHubOrganizationResponse =
  | VerifyGitHubOrganizationSuccessResponse
  | VerifyGitHubOrganizationErrorResponse;