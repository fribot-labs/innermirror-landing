import type { GitHubRepositorySummary } from "../../types/githubLearningEntry";

type RepositorySelectorProps = {
  repositories: GitHubRepositorySummary[];
  selectedRepository: GitHubRepositorySummary | null;
  onSelectRepository: (repository: GitHubRepositorySummary) => void;
};

export function RepositorySelector({
  repositories,
  selectedRepository,
  onSelectRepository,
}: RepositorySelectorProps) {
  const hasRepositories = repositories.length > 0;

  return (
    <section className="repository-selector">
      <div className="repository-selector-header">
        <span className="repository-selector-eyebrow">
          Repository Selection
        </span>

        <h2>Choose a repository for learning</h2>

        <p>
          Select the GitHub repository that will become the learning record for
          this PBL project.
        </p>
      </div>

      {hasRepositories ? (
        <div className="repository-selector-list">
          {repositories.map((repository) => {
            const repositoryKey = `${repository.owner}/${repository.name}`;
            const isSelected =
              selectedRepository?.owner === repository.owner &&
              selectedRepository?.name === repository.name;

            return (
              <button
                key={repositoryKey}
                className={
                  isSelected
                    ? "repository-selector-item repository-selector-item-selected"
                    : "repository-selector-item"
                }
                type="button"
                onClick={() => onSelectRepository(repository)}
              >
                <span className="repository-selector-name">
                  {repository.owner}/{repository.name}
                </span>

                <span className="repository-selector-branch">
                  Default branch: {repository.defaultBranch ?? "main"}
                </span>

                {isSelected ? (
                  <span className="repository-selector-selected-label">
                    Selected
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="repository-selector-empty">
          <strong>No repositories available</strong>

          <p>
            Connect GitHub first. Repository selection will be available after
            GitHub is connected.
          </p>
        </div>
      )}
    </section>
  );
}