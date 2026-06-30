import { useMemo, useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRepositories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return repositories;
    }

    return repositories.filter((repository) => {
      const searchableText = [
        repository.owner,
        repository.name,
        repository.fullName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [repositories, searchQuery]);

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

      {repositories.length > 0 ? (
        <div className="repository-selector-toolbar">
          <label className="repository-selector-search">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search repositories..."
            />
          </label>

          <div className="repository-selector-summary">
            {searchQuery.trim().length > 0 ? (
                <div className="repository-selector-summary">
                    Showing {filteredRepositories.length} of {repositories.length}
                </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {repositories.length === 0 ? (
        <div className="repository-selector-empty">
          <strong>No repositories available</strong>

          <p>
            Connect GitHub first. Repository selection will be available after
            GitHub is connected.
          </p>
        </div>
      ) : filteredRepositories.length === 0 ? (
        <div className="repository-selector-empty-search">
          <strong>No repositories match this search.</strong>

          <p>Try another repository name or owner.</p>
        </div>
      ) : (
        <div className="repository-selector-list">
          {filteredRepositories.map((repository) => {
            const isSelected =
              selectedRepository?.owner === repository.owner &&
              selectedRepository?.name === repository.name;

            return (
              <button
                key={`${repository.owner}/${repository.name}`}
                className={
                  isSelected
                    ? "repository-selector-card repository-selector-card-selected"
                    : "repository-selector-card"
                }
                type="button"
                onClick={() => onSelectRepository(repository)}
              >
                <div className="repository-selector-card-main">
                  <div className="repository-selector-name-group">
                    <strong>{repository.name}</strong>
                    <span>{repository.owner}</span>
                  </div>

                  <span
                    className={
                      repository.private
                        ? "repository-selector-badge repository-selector-badge-private"
                        : "repository-selector-badge repository-selector-badge-public"
                    }
                  >
                    {repository.private ? "Private" : "Public"}
                  </span>
                </div>

                <small className="repository-selector-meta">
                  {repository.defaultBranch ?? "main"}

                  {repository.updatedAt
                    ? ` · ${formatRepositoryDate(repository.updatedAt)}`
                    : ""}
                </small>

                {isSelected ? (
                  <span className="repository-selector-selected-label">
                    Selected
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatRepositoryDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}