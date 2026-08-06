import {
    useEffect,
    useState,
    type SubmitEvent
} from "react";

import {
    verifyRuntimeGitHubOrganization,
} from "../../github/verifyRuntimeGitHubOrganization";

import type {
    VerifyGitHubOrganizationErrorCode,
} from "../../github/githubOrganizationAssociationContract";

import type {
    GitHubRepositorySummary,
} from "../../types/githubLearningEntry";

type GitHubOrganizationVerificationState =
  | "idle"
  | "verifying"
  | "verified"
  | "error";

export type GitHubOrganizationVerificationProps = {
  githubSessionId: string | null;
  disabled?: boolean;

  onVerified: (
    organizationLogin: string,
    repositories: GitHubRepositorySummary[]
  ) => void;

  onSessionExpired?: () => void;
};

/**
 * GitHub Organization Verification
 *
 * This component allows the learner to propose a GitHub organization
 * for verification.
 *
 * Responsibility boundary:
 *
 * Landing:
 * - collects the organization login,
 * - sends a verification request,
 * - presents the Runtime result.
 *
 * Private Runtime:
 * - verifies active organization membership,
 * - applies Repository Association Policy,
 * - returns only eligible public repositories.
 *
 * Providing an organization login never grants repository access.
 */
export function GitHubOrganizationVerification({
  githubSessionId,
  disabled = false,
  onVerified,
  onSessionExpired,
}: GitHubOrganizationVerificationProps) {
  const [
    organizationLogin,
    setOrganizationLogin,
  ] = useState("");

  const [
    verificationState,
    setVerificationState,
  ] =
    useState<GitHubOrganizationVerificationState>(
      "idle"
    );

  const [
    verificationMessage,
    setVerificationMessage,
  ] = useState<string | null>(null);

  const [
    verifiedOrganizationLogin,
    setVerifiedOrganizationLogin,
  ] = useState<string | null>(null);

  const isUnavailable =
    disabled ||
    !githubSessionId ||
    verificationState === "verifying";

  useEffect(() => {
    /*
     * A changed Runtime GitHub session represents a new authorization
     * boundary. Verification results from the previous session must not
     * remain visible.
     */
    setOrganizationLogin("");
    setVerificationState("idle");
    setVerificationMessage(null);
    setVerifiedOrganizationLogin(null);
  }, [githubSessionId]);

    const handleSubmit = async (
      event: SubmitEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

    const normalizedOrganizationLogin =
      organizationLogin.trim();

    if (disabled) {
      return;
    }

    if (!githubSessionId) {
      setVerificationState("error");

      setVerificationMessage(
        "Reconnect GitHub before verifying an organization."
      );

      return;
    }

    if (
      normalizedOrganizationLogin.length === 0
    ) {
      setVerificationState("error");

      setVerificationMessage(
        "Enter a GitHub organization login."
      );

      return;
    }

    setVerificationState("verifying");
    setVerificationMessage(null);
    setVerifiedOrganizationLogin(null);

    try {
      const result =
        await verifyRuntimeGitHubOrganization({
          githubSessionId,
          organizationLogin:
            normalizedOrganizationLogin,
        });

      if (!result.ok) {
        setVerificationState("error");

        setVerificationMessage(
          getOrganizationVerificationMessage(
            result.error.code
          )
        );

        if (
          result.error.code ===
            "GITHUB_SESSION_EXPIRED" ||
          result.error.code ===
            "INVALID_GITHUB_SESSION_ID"
        ) {
          onSessionExpired?.();
        }

        return;
      }

      setVerificationState("verified");

      setVerifiedOrganizationLogin(
        result.organization.login
      );

      setVerificationMessage(
        createVerifiedMessage(
          result.organization.login,
          result.repositories.length
        )
      );

      onVerified(
        result.organization.login,
        result.repositories
      );
    } catch (error) {
      console.error(
        "Unable to verify GitHub organization.",
        error
      );

      setVerificationState("error");

      setVerificationMessage(
        error instanceof Error &&
          error.message.trim().length > 0
          ? error.message
          : "Organization verification is temporarily unavailable."
      );
    }
  };

  const handleOrganizationLoginChange = (
    value: string
  ) => {
    setOrganizationLogin(value);

    /*
     * Editing the candidate after a successful verification starts a
     * new verification attempt. Previously returned repositories remain
     * controlled by the parent until another result is accepted.
     */
    if (
      verificationState === "verified" ||
      verificationState === "error"
    ) {
      setVerificationState("idle");
      setVerificationMessage(null);
      setVerifiedOrganizationLogin(null);
    }
  };

  return (
    <section
      className="github-organization-verification"
      aria-labelledby="github-organization-verification-title"
    >
      <div className="github-organization-verification__header">
        <div>
          <p className="section-eyebrow">
            Organization repositories
          </p>

          <h3
            id="github-organization-verification-title"
            className="github-organization-verification__title"
          >
            Verify a GitHub organization
          </h3>
        </div>

        {verificationState === "verified" &&
        verifiedOrganizationLogin ? (
          <span className="github-organization-verification__badge">
            Verified
          </span>
        ) : null}
      </div>

      <p className="github-organization-verification__description">
        Enter an organization in which the connected
        GitHub account has an active membership. Only
        eligible public repositories are returned.
      </p>

      <form
        className="github-organization-verification__form"
        onSubmit={handleSubmit}
      >
        <label
          className="github-organization-verification__label"
          htmlFor="github-organization-login"
        >
          Organization login
        </label>

        <div className="github-organization-verification__controls">
          <input
            id="github-organization-login"
            className="github-organization-verification__input"
            type="text"
            value={organizationLogin}
            onChange={(event) =>
              handleOrganizationLoginChange(
                event.target.value
              )
            }
            placeholder="example-organization"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={39}
            disabled={
              disabled ||
              verificationState ===
                "verifying"
            }
            aria-describedby="github-organization-verification-help"
          />

          <button
            className="github-organization-verification__button"
            type="submit"
            disabled={
              isUnavailable ||
              organizationLogin.trim()
                .length === 0
            }
          >
            {getVerificationButtonLabel(
              verificationState
            )}
          </button>
        </div>

        <p
          id="github-organization-verification-help"
          className="github-organization-verification__help"
        >
          Enter the organization login only, not a
          GitHub URL. Providing a name does not grant
          access; the private Runtime verifies the
          relationship.
        </p>
      </form>

      {verificationMessage ? (
        <p
          className={[
            "github-organization-verification__message",
            verificationState === "verified"
              ? "github-organization-verification__message--success"
              : "github-organization-verification__message--error",
          ].join(" ")}
          role={
            verificationState === "error"
              ? "alert"
              : "status"
          }
          aria-live="polite"
        >
          {verificationMessage}
        </p>
      ) : null}

      {!githubSessionId && !disabled ? (
        <p
          className="github-organization-verification__message github-organization-verification__message--notice"
          role="status"
        >
          Connect GitHub before verifying an
          organization.
        </p>
      ) : null}
    </section>
  );
}

function getVerificationButtonLabel(
  state: GitHubOrganizationVerificationState
): string {
  switch (state) {
    case "verifying":
      return "Verifying...";

    case "verified":
      return "Verified";

    case "error":
      return "Try again";

    case "idle":
      return "Verify organization";
  }
}

function createVerifiedMessage(
  organizationLogin: string,
  repositoryCount: number
): string {
  if (repositoryCount === 0) {
    return `${organizationLogin} was verified, but no eligible public repositories were found.`;
  }

  if (repositoryCount === 1) {
    return `${organizationLogin} was verified. 1 public repository is available.`;
  }

  return `${organizationLogin} was verified. ${repositoryCount} public repositories are available.`;
}

function getOrganizationVerificationMessage(
  code: VerifyGitHubOrganizationErrorCode
): string {
  switch (code) {
    case "INVALID_ORGANIZATION_LOGIN":
      return "Enter a valid GitHub organization login.";

    case "INVALID_GITHUB_SESSION_ID":
    case "GITHUB_SESSION_EXPIRED":
      return "The Runtime GitHub session expired. Reconnect GitHub and try again.";

    case "GITHUB_AUTHENTICATED_USER_FETCH_FAILED":
      return "The connected GitHub user could not be verified. Reconnect GitHub and try again.";

    case "ORGANIZATION_NOT_AFFILIATED":
      return "The connected GitHub account does not have an active membership in this organization.";

    case "ORGANIZATION_MEMBERSHIP_PENDING":
      return "This GitHub organization membership is still pending.";

    case "ORGANIZATION_ACCESS_BLOCKED":
      return "This organization restricts access by the connected GitHub application. An organization owner may need to approve the application.";

    case "ORGANIZATION_REPOSITORY_FETCH_FAILED":
      return "The organization was verified, but its public repositories could not be loaded.";

    case "ORGANIZATION_VERIFICATION_UNAVAILABLE":
      return "GitHub organization verification is temporarily unavailable.";
  }
}