/**
 * Runtime GitHub Session Bridge
 *
 * Exchanges a GitHub provider token received from Supabase Auth
 * for an opaque Runtime GitHub session id.
 *
 * Security boundary:
 *
 * - The provider token is sent to the private Runtime only once.
 * - The provider token must not be stored in localStorage.
 * - The provider token must not be written to logs.
 * - The Landing stores only the returned githubSessionId.
 */

const RUNTIME_API_URL =
  import.meta.env.VITE_RUNTIME_API_URL ??
  "http://localhost:4000";

type RuntimeGitHubSessionSuccessResponse = {
  ok: true;
  data: {
    githubSessionId: string;
  };
};

type RuntimeGitHubSessionErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

type RuntimeGitHubSessionResponse =
  | RuntimeGitHubSessionSuccessResponse
  | RuntimeGitHubSessionErrorResponse;

export async function createRuntimeGitHubSession(
  providerToken: string
): Promise<string> {
  const normalizedProviderToken =
    providerToken.trim();

  if (normalizedProviderToken.length === 0) {
    throw new Error(
      "A GitHub provider token is required."
    );
  }

  const response = await fetch(
    `${RUNTIME_API_URL}/github/session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: "github",
        providerToken: normalizedProviderToken,
      }),
    }
  );

  let result: RuntimeGitHubSessionResponse;

  try {
    result =
      (await response.json()) as RuntimeGitHubSessionResponse;
  } catch {
    throw new Error(
      `Runtime GitHub session response was invalid (${response.status}).`
    );
  }

  if (!response.ok || !result.ok) {
    const message =
      !result.ok
        ? result.error.message
        : "Unable to establish Runtime GitHub session.";

    throw new Error(message);
  }

  const githubSessionId =
    result.data.githubSessionId.trim();

  if (githubSessionId.length === 0) {
    throw new Error(
      "Runtime GitHub session response did not include a session id."
    );
  }

  return githubSessionId;
}