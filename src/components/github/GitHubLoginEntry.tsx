import type { User } from "@supabase/supabase-js";

type GitHubConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

type GitHubLoginEntryProps = {
  connectionState: GitHubConnectionState;
  user: User | null;
  authMessage: string | null;
  onConnect: () => void;
  onSignOut: () => void;
};

function resolveGitHubDisplayName(user: User | null): string | null {
  if (user === null) {
    return null;
  }

  const userName = user.user_metadata?.user_name;
  const preferredUsername = user.user_metadata?.preferred_username;
  const fullName = user.user_metadata?.full_name;

  if (typeof userName === "string" && userName.trim().length > 0) {
    return userName;
  }

  if (
    typeof preferredUsername === "string" &&
    preferredUsername.trim().length > 0
  ) {
    return preferredUsername;
  }

  if (typeof fullName === "string" && fullName.trim().length > 0) {
    return fullName;
  }

  return user.email ?? "Authenticated user";
}

export function GitHubLoginEntry({
  connectionState,
  user,
  authMessage,
  onConnect,
  onSignOut,
}: GitHubLoginEntryProps) {
  const isConnecting = connectionState === "connecting";
  const isConnected = connectionState === "connected";
  const hasError = connectionState === "error";
  const hasAuthenticatedUser = user !== null;

  const displayName = resolveGitHubDisplayName(user);

  return (
    <section className="github-learning-entry">
      <div className="github-learning-entry-header">
        <span className="github-learning-entry-eyebrow">
          GitHub Learning Entry
        </span>

        <h2>Start learning from your GitHub repository</h2>

        <p>
          Connect GitHub, choose a repository, and begin a project-based
          learning flow powered by Reflection and Runtime analysis.
        </p>
      </div>

      <div className="github-learning-entry-card">
        <div className="github-learning-entry-status">
          <span
            className={`github-learning-entry-status-dot github-learning-entry-status-dot-${connectionState}`}
          />

          <div>
            <div>
              {isConnected
                ? "GitHub connected"
                : isConnecting
                  ? "Connecting GitHub..."
                  : hasError
                    ? "GitHub connection failed"
                    : "GitHub not connected"}
            </div>

            {hasAuthenticatedUser && displayName !== null ? (
              <div className="github-learning-entry-user">
                Signed in as {displayName}
              </div>
            ) : null}
          </div>
        </div>

        {hasAuthenticatedUser ? (
          <button
            className="github-learning-entry-button"
            type="button"
            onClick={onSignOut}
            disabled={isConnecting}
          >
            {isConnecting ? "Signing out..." : "Sign out"}
          </button>
        ) : (
          <button
            className="github-learning-entry-button"
            type="button"
            onClick={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect GitHub"}
          </button>
        )}
      </div>

      {authMessage !== null ? (
        <p
          className="github-learning-entry-auth-message"
          role="alert"
        >
          {authMessage}
        </p>
      ) : null}

      <div className="github-learning-entry-policy">
        <strong>MVP sync rule</strong>

        <p>
          GitHub data is checked only when the learner explicitly uses{" "}
          <b>Analyze GitHub Project</b> or{" "}
          <b>Thought + Project Analyze</b>.
        </p>

        <ul>
          <li>No webhook</li>
          <li>No scheduler</li>
          <li>No polling</li>
          <li>No background sync</li>
        </ul>
      </div>
    </section>
  );
}