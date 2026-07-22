import {
    useEffect,
    useState,
} from "react";

import type {
    RuntimeActionHistoryEntryViewModel,
} from "../../runtime-action-history/createRuntimeActionHistoryViewModel";

type RuntimeActionHistoryEntryCardProps = {
  entry:
    RuntimeActionHistoryEntryViewModel;
};

export function RuntimeActionHistoryEntryCard({
  entry,
}: RuntimeActionHistoryEntryCardProps) {
  const [
    isExpanded,
    setIsExpanded,
  ] = useState(
    entry.isCurrent
  );

  useEffect(() => {
    if (entry.isCurrent) {
      setIsExpanded(true);
    }
  }, [
    entry.isCurrent,
  ]);

  return (
    <article
      className={[
        "runtime-action-history-entry",
        entry.isCurrent
          ? "runtime-action-history-entry--current"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="runtime-action-history-entry__header">
        <div>
          <div className="runtime-action-history-entry__labels">
            <span
              className={[
                "runtime-action-history-status",
                `runtime-action-history-status--${entry.statusTone}`,
              ].join(" ")}
            >
              {entry.statusLabel}
            </span>

            {entry.resolutionLabel !== null ? (
              <span className="runtime-action-history-resolution">
                {entry.resolutionLabel}
              </span>
            ) : null}
          </div>

          <h3 className="runtime-action-history-entry__title">
            {entry.title}
          </h3>
        </div>

        <button
          type="button"
          className="runtime-action-history-entry__toggle"
          onClick={() =>
            setIsExpanded(
              (current) =>
                !current
            )
          }
          aria-expanded={
            isExpanded
          }
        >
          <span
            aria-hidden="true"
            className="runtime-action-history-entry__toggle-icon"
          >
            {isExpanded
              ? "▾"
              : "▸"}
          </span>

          <span>
            {isExpanded
              ? "Hide details"
              : "Show details"}
          </span>
        </button>
      </div>

      <p className="runtime-action-history-entry__description">
        {entry.description}
      </p>

      <div className="runtime-action-history-entry__meta">
        <span>
          First observed{" "}
          {entry.firstObservedLabel}
        </span>

        {entry.completedLabel !== null ? (
          <span>
            Completed{" "}
            {entry.completedLabel}
          </span>
        ) : null}
      </div>

      {isExpanded ? (
        <div className="runtime-action-history-entry__details">
          {entry.whySummary !== null ? (
            <div>
              <div className="runtime-action-history-entry__detail-label">
                Why Runtime recommended this
              </div>

              <p>
                {entry.whySummary}
              </p>
            </div>
          ) : null}

          {entry.evidenceSummary !== null ? (
            <div>
              <div className="runtime-action-history-entry__detail-label">
                Evidence summary
              </div>

              <p>
                {entry.evidenceSummary}
              </p>
            </div>
          ) : null}

          {entry.completionEvidence.length > 0 ? (
            <div>
              <div className="runtime-action-history-entry__detail-label">
                Completion evidence
              </div>

              <ul>
                {entry.completionEvidence.map(
                  (evidence) => (
                    <li
                      key={`${evidence.typeLabel}-${evidence.occurredAtLabel}`}
                      className="runtime-action-history-entry__evidence-item"
                    >
                      <strong className="runtime-action-history-entry__evidence-title">
                        {evidence.typeLabel}
                      </strong>

                      <span className="runtime-action-history-entry__evidence-description">
                        {evidence.description}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          <div className="runtime-action-history-entry__counts">
            <span>
              Signals{" "}
              {entry.signalCount}
            </span>

            <span>
              Visited{" "}
              {entry.navigationCount}
            </span>
          </div>
        </div>
      ) : null}
    </article>
  );
}