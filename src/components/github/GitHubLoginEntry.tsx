import type { User } from "@supabase/supabase-js";

import type {
  RuntimeGitHubSessionState,
} from "../../github/runtimeGitHubSessionTypes";

type GitHubConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

type GitHubLoginEntryProps = {
  connectionState:
    GitHubConnectionState;

  runtimeSessionState:
    RuntimeGitHubSessionState;

  user:
    User | null;

  authMessage:
    string | null;

  onConnect:
    () => void;

  onReconnectRuntime:
    () => void;

  onSignOut:
    () => void;

  onResetGitHubAccess:
    () => void;

  isRuntimeReconnectAvailable:
    boolean;
};

function resolveGitHubDisplayName(
  user: User | null
): string | null {
  if (user === null) {
    return null;
  }

  const userName =
    user.user_metadata?.user_name;

  const preferredUsername =
    user.user_metadata?.preferred_username;

  const fullName =
    user.user_metadata?.full_name;

  if (
    typeof userName === "string" &&
    userName.trim().length > 0
  ) {
    return userName;
  }

  if (
    typeof preferredUsername === "string" &&
    preferredUsername.trim().length > 0
  ) {
    return preferredUsername;
  }

  if (
    typeof fullName === "string" &&
    fullName.trim().length > 0
  ) {
    return fullName;
  }

  return user.email ??
    "Authenticated user";
}

function getGitHubConnectionLabel(
  connectionState: GitHubConnectionState
): string {
  switch (connectionState) {
    case "connected":
      return "GitHub connected";

    case "connecting":
      return "Connecting GitHub...";

    case "error":
      return "GitHub connection failed";

    case "disconnected":
      return "GitHub not connected";
  }
}

function getRuntimeSessionLabel(
  state: RuntimeGitHubSessionState
): string {
  switch (state) {
    case "idle":
      return "Runtime not connected";

    case "creating":
      return "Connecting Runtime...";

    case "ready":
      return "Runtime ready";

    case "unavailable":
      return "Runtime unavailable";

    case "expired":
      return "Runtime session expired";

    case "error":
      return "Runtime connection failed";
  }
}

function getRuntimeSessionDescription(
  state: RuntimeGitHubSessionState
): string | null {
  switch (state) {
    case "idle":
      return "Connect GitHub to establish a Runtime session.";

    case "creating":
      return "Creating a temporary Runtime authorization session.";

    case "ready":
      return "Repository access is available through the private Runtime.";

    case "unavailable":
      return "Start the private Runtime, then reconnect Runtime to restore repository access.";

    case "expired":
      return "Reconnect Runtime to continue loading and analyzing repositories.";

    case "error":
      return "Runtime authorization could not be established.";

    default:
      return null;
  }
}

function getRuntimeSessionClassName(
  state: RuntimeGitHubSessionState
): string {
  return [
    "github-runtime-session-status",
    `github-runtime-session-status-${state}`,
  ].join(" ");
}

export function GitHubLoginEntry({
  connectionState,
  runtimeSessionState,
  user,
  authMessage,
  onConnect,
  onReconnectRuntime,
  onSignOut,
  onResetGitHubAccess,
  isRuntimeReconnectAvailable,
}: GitHubLoginEntryProps) {
  const isConnecting =
    connectionState === "connecting";

  const isConnected =
    connectionState === "connected";

  const isRuntimeCreating =
    runtimeSessionState === "creating";

  const shouldShowRuntimeReconnect =
    isRuntimeReconnectAvailable &&
    (
      runtimeSessionState === "unavailable" ||
      runtimeSessionState === "expired" ||
      runtimeSessionState === "error" ||
      runtimeSessionState === "creating"
    );

  const hasAuthenticatedUser =
    user !== null;

  const displayName =
    resolveGitHubDisplayName(user);

  const runtimeSessionDescription =
    getRuntimeSessionDescription(
      runtimeSessionState
    );

  return (
    <section className="github-learning-entry">
      <div className="github-learning-entry-header">
        <span className="github-learning-entry-eyebrow">
          GITHUB CONNECTION
        </span>

        <h2>
          Connect your GitHub repository
        </h2>

        <p>
          Connect GitHub.
          Choose a repository.
          Start understanding your project.
        </p>
      </div>

      <div className="github-learning-entry-card">
        <div className="github-learning-entry-status-list">
          <div className="github-learning-entry-status">
            <span
              className={[
                "github-learning-entry-status-dot",
                `github-learning-entry-status-dot-${connectionState}`,
              ].join(" ")}
            />

            <div>
              <div>
                {getGitHubConnectionLabel(
                  connectionState
                )}
              </div>

              {hasAuthenticatedUser &&
              displayName !== null ? (
                <div className="github-learning-entry-user">
                  Signed in as {displayName}
                </div>
              ) : null}
            </div>
          </div>

          {hasAuthenticatedUser ? (
            <div
              className={getRuntimeSessionClassName(
                runtimeSessionState
              )}
            >
              <span
                className={[
                  "github-learning-entry-status-dot",
                  `github-runtime-session-status-dot-${runtimeSessionState}`,
                ].join(" ")}
              />

              <div>
                <div>
                  {getRuntimeSessionLabel(
                    runtimeSessionState
                  )}
                </div>

                {runtimeSessionDescription !== null ? (
                  <div className="github-runtime-session-description">
                    {runtimeSessionDescription}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {hasAuthenticatedUser ? (
          <div className="github-learning-entry-actions">
            {shouldShowRuntimeReconnect ? (
              <button
                className="github-learning-entry-button"
                type="button"
                onClick={onReconnectRuntime}
                disabled={
                  isConnecting ||
                  isRuntimeCreating
                }
              >
                {isRuntimeCreating
                  ? "Reconnecting Runtime..."
                  : "Reconnect Runtime"}
              </button>
            ) : null}

            <button
              className="github-learning-entry-button"
              type="button"
              onClick={onSignOut}
              disabled={
                isConnecting ||
                isRuntimeCreating
              }
            >
              {isConnecting
                ? "Signing out..."
                : "Sign out"}
            </button>

            <button
              className="github-learning-entry-secondary-button"
              type="button"
              onClick={onResetGitHubAccess}
              disabled={
                isConnecting ||
                isRuntimeCreating
              }
            >
              GitHub 계정 다시 연결
            </button>
          </div>
        ) : (
          <button
            className="github-learning-entry-button"
            type="button"
            onClick={onConnect}
            disabled={isConnecting}
          >
            {isConnecting
              ? "Connecting..."
              : "Connect GitHub"}
          </button>
        )}
      </div>

      {authMessage !== null ? (
        <p
          className="github-learning-entry-auth-message"
          role={
            runtimeSessionState === "ready"
              ? "status"
              : "alert"
          }
          aria-live="polite"
        >
          {authMessage}
        </p>
      ) : null}

      <div className="github-learning-entry-policy">
        <strong>MVP sync rule</strong>

        <p>
          GitHub data is checked only when the learner
          explicitly uses{" "}
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