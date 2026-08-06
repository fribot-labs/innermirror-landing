import { useMemo, useState } from "react";
import type { GitHubRepositorySummary } from "../../types/githubLearningEntry";

const DEFAULT_VISIBLE_REPOSITORY_COUNT = 5;

type RepositorySelectorProps = {
  repositories: GitHubRepositorySummary[];
  selectedRepository: GitHubRepositorySummary | null;
  onSelectRepository: (repository: GitHubRepositorySummary) => void;
  availabilityMessage:
    string | null;
};

type RepositoryCardProps = {
  repository: GitHubRepositorySummary;
  isSelected: boolean;
  onSelectRepository: (repository: GitHubRepositorySummary) => void;
};

export function RepositorySelector({
  repositories,
  selectedRepository,
  onSelectRepository,
  availabilityMessage,
}: RepositorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const filteredRepositories = useMemo(() => {
    if (!isSearching) {
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
  }, [repositories, normalizedQuery, isSearching]);

  const visibleRepositories = isSearching
    ? filteredRepositories
    : filteredRepositories.slice(
        0,
        DEFAULT_VISIBLE_REPOSITORY_COUNT
      );

  const hiddenRepositories = isSearching
    ? []
    : filteredRepositories.slice(
        DEFAULT_VISIBLE_REPOSITORY_COUNT
      );

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

          {isSearching ? (
            <div className="repository-selector-summary">
              Showing {filteredRepositories.length} of {repositories.length}
            </div>
          ) : (
            <div className="repository-selector-summary">
              Showing {Math.min(
                repositories.length,
                DEFAULT_VISIBLE_REPOSITORY_COUNT
              )} of {repositories.length}
            </div>
          )}
        </div>
      ) : null}

      {repositories.length === 0 ? (
        <div className="repository-selector-empty">
          <strong>
            No repositories available
          </strong>

          {availabilityMessage !== null ? (
            <p>
              {availabilityMessage}
            </p>
          ) : null}
        </div>
      ) : filteredRepositories.length === 0 ? (
        <div className="repository-selector-empty-search">
          <strong>No repositories match this search.</strong>

          <p>Try another repository name or owner.</p>
        </div>
      ) : (
        <>
          <div className="repository-selector-list">
            {visibleRepositories.map((repository) => (
              <RepositoryCard
                key={`${repository.owner}/${repository.name}`}
                repository={repository}
                isSelected={isSameRepository(
                  selectedRepository,
                  repository
                )}
                onSelectRepository={onSelectRepository}
              />
            ))}
          </div>

          {hiddenRepositories.length > 0 ? (
            <details className="github-repository-more">
              <summary>
                Show {hiddenRepositories.length} more repositories
              </summary>

              <div className="repository-selector-list">
                {hiddenRepositories.map((repository) => (
                  <RepositoryCard
                    key={`${repository.owner}/${repository.name}`}
                    repository={repository}
                    isSelected={isSameRepository(
                      selectedRepository,
                      repository
                    )}
                    onSelectRepository={onSelectRepository}
                  />
                ))}
              </div>
            </details>
          ) : null}
        </>
      )}
    </section>
  );
}

function RepositoryCard({
  repository,
  isSelected,
  onSelectRepository,
}: RepositoryCardProps) {
  return (
    <button
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
}

function isSameRepository(
  selectedRepository: GitHubRepositorySummary | null,
  repository: GitHubRepositorySummary
): boolean {
  return (
    selectedRepository?.owner === repository.owner &&
    selectedRepository?.name === repository.name
  );
}

function formatRepositoryDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}