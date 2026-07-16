import type { ReactNode } from "react";

type CollapsibleAnalysisSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function CollapsibleAnalysisSection({
  eyebrow,
  title,
  description,
  children,
  defaultOpen = false,
  className = "",
}: CollapsibleAnalysisSectionProps) {
  const classes = [
    "collapsible-analysis-section",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <details
      className={classes}
      open={defaultOpen}
    >
      <summary className="collapsible-analysis-section-summary">
        <div>
          {eyebrow ? (
            <span className="collapsible-analysis-section-eyebrow">
              {eyebrow}
            </span>
          ) : null}

          <strong>{title}</strong>

          {description ? (
            <small>{description}</small>
          ) : null}
        </div>

        <span
          className="collapsible-analysis-section-indicator"
          aria-hidden="true"
        >
          View
        </span>
      </summary>

      <div className="collapsible-analysis-section-content">
        {children}
      </div>
    </details>
  );
}