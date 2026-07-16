import type { GitHubSnapshotState } from "../../types/githubSnapshot";

const DEFAULT_VISIBLE_COMMIT_COUNT = 3;
const DEFAULT_VISIBLE_PULL_REQUEST_COUNT = 2;

type GitHubSnapshotPanelProps = {
  snapshotState: GitHubSnapshotState;
};

type SnapshotCommit =
  NonNullable<GitHubSnapshotState["snapshot"]>["recentCommits"][number];

type SnapshotPullRequest =
  NonNullable<
    GitHubSnapshotState["snapshot"]
  >["recentPullRequests"][number];

type SnapshotCommitItemProps = {
  commit: SnapshotCommit;
};

type SnapshotPullRequestItemProps = {
  pullRequest: SnapshotPullRequest;
};

export function GitHubSnapshotPanel({
  snapshotState,
}: GitHubSnapshotPanelProps) {
  const { status, snapshot, error } = snapshotState;

  if (status === "idle") {
    return (
      <section className="github-snapshot-panel github-snapshot-panel-idle">
        <div className="github-snapshot-panel-header">
          <span className="github-snapshot-panel-eyebrow">
            Project Snapshot
          </span>

          <h2>No Project snapshot yet</h2>

          <p>
            Press <b>Analyze GitHub Project</b> to capture recent activity.
          </p>
        </div>
      </section>
    );
  }

  if (status === "loading") {
    return (
      <section className="github-snapshot-panel github-snapshot-panel-loading">
        <div className="github-snapshot-panel-header">
          <span className="github-snapshot-panel-eyebrow">
            Project Snapshot
          </span>

          <h2>Capturing Project snapshot...</h2>

          <p>
            Collecting the latest commits and pull requests.
          </p>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="github-snapshot-panel github-snapshot-panel-error">
        <div className="github-snapshot-panel-header">
          <span className="github-snapshot-panel-eyebrow">
            Project Snapshot
          </span>

          <h2>Snapshot capture failed</h2>

          <p>{error ?? "Unable to capture GitHub snapshot."}</p>
        </div>
      </section>
    );
  }

  if (snapshot === null) {
    return null;
  }

  const visibleCommits = snapshot.recentCommits.slice(
    0,
    DEFAULT_VISIBLE_COMMIT_COUNT
  );

  const hiddenCommits = snapshot.recentCommits.slice(
    DEFAULT_VISIBLE_COMMIT_COUNT
  );

  const visiblePullRequests = snapshot.recentPullRequests.slice(
    0,
    DEFAULT_VISIBLE_PULL_REQUEST_COUNT
  );

  const hiddenPullRequests = snapshot.recentPullRequests.slice(
    DEFAULT_VISIBLE_PULL_REQUEST_COUNT
  );

  const hasHiddenSnapshotActivity =
    hiddenCommits.length > 0 || hiddenPullRequests.length > 0;

  return (
    <section className="github-snapshot-panel">
      <div className="github-snapshot-panel-header">
        <span className="github-snapshot-panel-eyebrow">
          Project Snapshot
        </span>

        <h2>Latest GitHub activity</h2>

        <p>
          Captured from {snapshot.repository.name}.
        </p>

        <small>
          Captured at:{" "}
          <time dateTime={snapshot.capturedAt}>
            {formatDateTime(snapshot.capturedAt)}
          </time>
        </small>
      </div>

      <div className="github-snapshot-panel-summary">
        <div className="github-snapshot-panel-summary-card">
          <span>Commits captured</span>
          <strong>{snapshot.recentCommits.length}</strong>
        </div>

        <div className="github-snapshot-panel-summary-card">
          <span>Pull requests captured</span>
          <strong>{snapshot.recentPullRequests.length}</strong>
        </div>
      </div>

      {visibleCommits.length > 0 ? (
        <div className="github-snapshot-panel-section">
          <h3>Recent commits</h3>

          <ol className="github-snapshot-panel-list">
            {visibleCommits.map((commit, index) => (
              <SnapshotCommitItem
                key={`${commit.sha}-${index}`}
                commit={commit}
              />
            ))}
          </ol>
        </div>
      ) : null}

      {visiblePullRequests.length > 0 ? (
        <div className="github-snapshot-panel-section">
          <h3>Recent pull requests</h3>

          <ol className="github-snapshot-panel-list">
            {visiblePullRequests.map((pullRequest, index) => (
              <SnapshotPullRequestItem
                key={`${pullRequest.id}-${index}`}
                pullRequest={pullRequest}
              />
            ))}
          </ol>
        </div>
      ) : null}

      {hasHiddenSnapshotActivity ? (
        <details className="project-snapshot-more">
          <summary>View older snapshot activity</summary>

          {hiddenCommits.length > 0 ? (
            <div className="project-snapshot-more-section">
              <h4>
                Older commits ({hiddenCommits.length})
              </h4>

              <ol className="github-snapshot-panel-list">
                {hiddenCommits.map((commit, index) => (
                  <SnapshotCommitItem
                    key={`older-${commit.sha}-${index}`}
                    commit={commit}
                  />
                ))}
              </ol>
            </div>
          ) : null}

          {hiddenPullRequests.length > 0 ? (
            <div className="project-snapshot-more-section">
              <h4>
                Older pull requests ({hiddenPullRequests.length})
              </h4>

              <ol className="github-snapshot-panel-list">
                {hiddenPullRequests.map(
                  (pullRequest, index) => (
                    <SnapshotPullRequestItem
                      key={`older-${pullRequest.id}-${index}`}
                      pullRequest={pullRequest}
                    />
                  )
                )}
              </ol>
            </div>
          ) : null}
        </details>
      ) : null}
    </section>
  );
}

function SnapshotCommitItem({
  commit,
}: SnapshotCommitItemProps) {
  return (
    <li className="github-snapshot-panel-list-item">
      <div>
        <strong>{commit.message}</strong>

        <small>
          {commit.sha.slice(0, 7)}
          {commit.authorName ? ` · ${commit.authorName}` : ""}
          {commit.committedAt
            ? ` · ${formatDateTime(commit.committedAt)}`
            : ""}
        </small>
      </div>
    </li>
  );
}

function SnapshotPullRequestItem({
  pullRequest,
}: SnapshotPullRequestItemProps) {
  return (
    <li className="github-snapshot-panel-list-item">
      <div>
        <strong>
          #{pullRequest.number} {pullRequest.title}
        </strong>

        <small>
          {pullRequest.state}
          {pullRequest.authorName
            ? ` · ${pullRequest.authorName}`
            : ""}
          {pullRequest.createdAt
            ? ` · ${formatDateTime(pullRequest.createdAt)}`
            : ""}
        </small>
      </div>
    </li>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}