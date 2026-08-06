import type {
    VerifyGitHubOrganizationRequest,
    VerifyGitHubOrganizationResponse,
} from "./githubOrganizationAssociationContract";

const DEFAULT_RUNTIME_API_URL =
  "http://localhost:4000";

export type VerifyRuntimeGitHubOrganizationOptions = {
  githubSessionId: string;
  organizationLogin: string;
};

export async function verifyRuntimeGitHubOrganization({
  githubSessionId,
  organizationLogin,
}: VerifyRuntimeGitHubOrganizationOptions): Promise<
  VerifyGitHubOrganizationResponse
> {
  const normalizedSessionId =
    githubSessionId.trim();

  const normalizedOrganizationLogin =
    organizationLogin.trim();

  if (normalizedSessionId.length === 0) {
    throw new Error(
      "A Runtime GitHub session id is required."
    );
  }

  if (
    normalizedOrganizationLogin.length === 0
  ) {
    throw new Error(
      "A GitHub organization login is required."
    );
  }

  const runtimeApiUrl =
    import.meta.env.VITE_RUNTIME_API_URL ??
    DEFAULT_RUNTIME_API_URL;

  const url = new URL(
    "/github/organizations/verify",
    runtimeApiUrl
  );

  url.searchParams.set(
    "sessionId",
    normalizedSessionId
  );

  const body:
    VerifyGitHubOrganizationRequest = {
      organizationLogin:
        normalizedOrganizationLogin,
    };

  const response = await fetch(
    url.toString(),
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const result =
    (await response.json()) as
      VerifyGitHubOrganizationResponse;

  return result;
}