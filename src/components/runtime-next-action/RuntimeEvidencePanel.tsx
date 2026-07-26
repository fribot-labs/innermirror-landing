import {
  useId,
  useState,
} from "react";

import type {
  RuntimeEvidenceExplanation,
  RuntimeEvidenceGroup,
  RuntimeEvidenceItem,
} from "../../runtime-next-action/runtimeEvidenceTypes";

type RuntimeEvidencePanelProps = {
  evidence:
    RuntimeEvidenceExplanation | undefined;
};

export function RuntimeEvidencePanel({
  evidence,
}: RuntimeEvidencePanelProps) {
  const [
    isExpanded,
    setIsExpanded,
  ] = useState(false);

  const detailsId =
    useId();

  if (evidence === undefined) {
    return null;
  }

  const signalCount =
    countEvidenceSignals(
      evidence
    );

  const canShowStructuredEvidence =
    evidence.disclosure ===
    "structured";

  return (
    <section
      className={[
        "runtime-evidence-panel",
        isExpanded
          ? "runtime-evidence-panel--expanded"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Evidence behind this recommendation"
    >
      <div className="runtime-evidence-panel__header">
        <div className="runtime-evidence-panel__intro">
          <p className="runtime-evidence-panel__eyebrow">
            Evidence behind this recommendation
          </p>

          <p className="runtime-evidence-panel__summary">
            {evidence.summary}
          </p>
        </div>

        <span className="runtime-evidence-panel__signal-count">
          {signalCount}{" "}
          {signalCount === 1
            ? "signal"
            : "signals"}
        </span>
      </div>

      {canShowStructuredEvidence ? (
        <button
          type="button"
          className="runtime-evidence-panel__toggle"
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          onClick={() =>
            setIsExpanded(
              (current) =>
                !current
            )
          }
        >
          <span
            className="runtime-evidence-panel__toggle-icon"
            aria-hidden="true"
          >
            {isExpanded
              ? "▾"
              : "▸"}
          </span>

          <span>
            {isExpanded
              ? "Hide recommendation evidence"
              : "View recommendation evidence"}
          </span>
        </button>
      ) : null}

      {canShowStructuredEvidence &&
      isExpanded ? (
        <div
          id={detailsId}
          className="runtime-evidence-panel__details"
        >
          <RuntimeEvidenceGroupView
            sectionLabel="Primary evidence"
            group={evidence.primary}
          />

          {evidence.supporting.length > 0 ? (
            <section className="runtime-evidence-panel__section">
              <p className="runtime-evidence-panel__section-title">
                Supporting evidence
              </p>

              <div className="runtime-evidence-panel__groups">
                {evidence.supporting.map(
                  (group) => (
                    <RuntimeEvidenceGroupView
                      key={group.id}
                      group={group}
                    />
                  )
                )}
              </div>
            </section>
          ) : null}

          {evidence.context.length > 0 ? (
            <section className="runtime-evidence-panel__section">
              <p className="runtime-evidence-panel__section-title">
                Project context
              </p>

              <div className="runtime-evidence-panel__groups">
                {evidence.context.map(
                  (group) => (
                    <RuntimeEvidenceGroupView
                      key={group.id}
                      group={group}
                    />
                  )
                )}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

type RuntimeEvidenceGroupViewProps = {
  sectionLabel?: string;

  group:
    RuntimeEvidenceGroup;
};

function RuntimeEvidenceGroupView({
  sectionLabel,
  group,
}: RuntimeEvidenceGroupViewProps) {
  return (
    <article className="runtime-evidence-group">
      {sectionLabel !== undefined ? (
        <p className="runtime-evidence-group__section-label">
          {sectionLabel}
        </p>
      ) : null}

      <h4 className="runtime-evidence-group__title">
        {group.title}
      </h4>

      <p className="runtime-evidence-group__description">
        {group.description}
      </p>

      {group.items.length > 0 ? (
        <dl className="runtime-evidence-list">
          {group.items.map(
            (item) => (
              <RuntimeEvidenceItemView
                key={`${group.id}-${item.id}`}
                item={item}
              />
            )
          )}
        </dl>
      ) : (
        <p className="runtime-evidence-group__empty">
          No additional structured evidence is available.
        </p>
      )}
    </article>
  );
}

type RuntimeEvidenceItemViewProps = {
  item:
    RuntimeEvidenceItem;
};

function RuntimeEvidenceItemView({
  item,
}: RuntimeEvidenceItemViewProps) {
  return (
    <div className="runtime-evidence-item">
      <dt className="runtime-evidence-item__label">
        {item.label}
      </dt>

      <dd className="runtime-evidence-item__content">
        <strong className="runtime-evidence-item__value">
          {formatEvidenceValue(
            item.value
          )}
        </strong>

        <span className="runtime-evidence-item__description">
          {item.description}
        </span>
      </dd>
    </div>
  );
}

function formatEvidenceValue(
  value:
    RuntimeEvidenceItem["value"]
): string {
  if (
    typeof value === "boolean"
  ) {
    return value
      ? "Available"
      : "Not available";
  }

  return String(value);
}

function countEvidenceSignals(
  evidence:
    RuntimeEvidenceExplanation
): number {
  const primaryCount =
    evidence.primary.items.length;

  const supportingCount =
    evidence.supporting.reduce(
      (
        total,
        group
      ) =>
        total +
        group.items.length,
      0
    );

  const contextCount =
    evidence.context.reduce(
      (
        total,
        group
      ) =>
        total +
        group.items.length,
      0
    );

  return (
    primaryCount +
    supportingCount +
    contextCount
  );
}