type ServiceEntryCardProps = {
  eyebrow: string;

  title: string;

  description: string;

  flow: string[];

  actionLabel: string;

  onAction: () => void;

  secondaryText?: string;
};

export function ServiceEntryCard({
  eyebrow,
  title,
  description,
  flow,
  actionLabel,
  onAction,
  secondaryText,
}: ServiceEntryCardProps) {
  return (
    <article className="service-entry-card">
      <p className="service-entry-card__eyebrow">
        {eyebrow}
      </p>

      <h3 className="service-entry-card__title">
        {title}
      </h3>

      <p className="service-entry-card__description">
        {description}
      </p>

      <div
        className="service-entry-card__flow"
        aria-label={`${title} workflow`}
      >
        {flow.map(
          (
            step,
            index
          ) => (
            <div
              className="service-entry-card__flow-step"
              key={`${step}-${index}`}
            >
              <span>
                {step}
              </span>

              {index <
                flow.length -
                  1 && (
                <span
                  className="service-entry-card__flow-arrow"
                  aria-hidden="true"
                >
                  ↓
                </span>
              )}
            </div>
          )
        )}
      </div>

      {secondaryText ? (
        <p className="service-entry-card__secondary">
          {secondaryText}
        </p>
      ) : null}

      <button
        className="service-entry-card__action"
        type="button"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </article>
  );
}