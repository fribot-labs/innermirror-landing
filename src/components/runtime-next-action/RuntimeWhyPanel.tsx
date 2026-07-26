import {
  useId,
  useState,
} from "react";

import type {
  RuntimeWhyExplanation,
} from "../../runtime-next-action/runtimeWhyTypes";

type RuntimeWhyPanelProps = {
  why:
    RuntimeWhyExplanation | undefined;

  fallbackReason:
    string;
};

export function RuntimeWhyPanel({
  why,
  fallbackReason,
}: RuntimeWhyPanelProps) {
  const [
    isExpanded,
    setIsExpanded,
  ] = useState(false);

  const detailsId =
    useId();

  if (why === undefined) {
    return (
      <section
        className="runtime-why-panel"
        aria-label="Runtime recommendation reasoning"
      >
        <p className="runtime-why-panel__eyebrow">
          Why Runtime recommends this
        </p>

        <p className="runtime-why-panel__summary">
          {fallbackReason}
        </p>
      </section>
    );
  }

  return (
    <section
      className={[
        "runtime-why-panel",
        isExpanded
          ? "runtime-why-panel--expanded"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Runtime recommendation reasoning"
    >
      <div className="runtime-why-panel__header">
        <div className="runtime-why-panel__intro">
          <p className="runtime-why-panel__eyebrow">
            Why Runtime recommends this
          </p>

          <p className="runtime-why-panel__summary">
            {why.summary}
          </p>
        </div>

        <span
          className={[
            "runtime-why-panel__priority",
            `runtime-why-panel__priority--${why.priority}`,
          ].join(" ")}
        >
          {formatWhyPriority(
            why.priority
          )}
        </span>
      </div>

      <button
        type="button"
        className="runtime-why-panel__toggle"
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
          className="runtime-why-panel__toggle-icon"
          aria-hidden="true"
        >
          {isExpanded
            ? "▾"
            : "▸"}
        </span>

        <span>
          {isExpanded
            ? "Hide Runtime reasoning"
            : "Show Runtime reasoning"}
        </span>
      </button>

      {isExpanded ? (
        <div
          id={detailsId}
          className="runtime-why-panel__details"
        >
          <RuntimeWhyDetail
            label="Current context"
            value={why.context}
          />

          <RuntimeWhyDetail
            label="Why this comes first"
            value={why.priorityReason}
          />

          <RuntimeWhyDetail
            label="Expected outcome"
            value={why.expectedOutcome}
          />
        </div>
      ) : null}
    </section>
  );
}

type RuntimeWhyDetailProps = {
  label:
    string;

  value:
    string;
};

function RuntimeWhyDetail({
  label,
  value,
}: RuntimeWhyDetailProps) {
  return (
    <div className="runtime-why-panel__detail">
      <p className="runtime-why-panel__detail-label">
        {label}
      </p>

      <p className="runtime-why-panel__detail-value">
        {value}
      </p>
    </div>
  );
}

function formatWhyPriority(
  priority:
    RuntimeWhyExplanation[
      "priority"
    ]
): string {
  switch (priority) {
    case "blocking":
      return "Required first";

    case "primary":
      return "Primary reason";

    case "reinforced":
      return "Multiple signals";

    case "fallback":
      return "Best available";
  }
}