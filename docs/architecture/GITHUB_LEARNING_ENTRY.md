type GitHubConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

type GitHubLoginEntryProps = {
  connectionState: GitHubConnectionState;
  onConnect: () => void;
};

export function GitHubLoginEntry({
  connectionState,
  onConnect,
}: GitHubLoginEntryProps) {
  const isConnecting = connectionState === "connecting";
  const isConnected = connectionState === "connected";
  const hasError = connectionState === "error";

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

          <span>
            {isConnected
              ? "GitHub connected"
              : isConnecting
                ? "Connecting GitHub..."
                : hasError
                  ? "GitHub connection failed"
                  : "GitHub not connected"}
          </span>
        </div>

        <button
          className="github-learning-entry-button"
          type="button"
          onClick={onConnect}
          disabled={isConnecting || isConnected}
        >
          {isConnected
            ? "GitHub Connected"
            : isConnecting
              ? "Connecting..."
              : "Connect GitHub"}
        </button>
      </div>

      <div className="github-learning-entry-policy">
        <strong>MVP sync rule</strong>

        <p>
          GitHub data is checked only when the learner explicitly presses{" "}
          <b>Reflect + GitHub Analyze</b>.
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