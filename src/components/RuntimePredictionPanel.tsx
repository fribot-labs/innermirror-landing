import {
    hasRuntimePredictiveEvidence,
    hasRuntimePredictivePrimaryItems,
    hasRuntimePredictiveWarnings,
    type RuntimePredictiveInsight,
    type RuntimePredictivePresentation,
    type RuntimePredictivePrimaryItem,
} from "./runtimePredictivePresentationTypes";

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */

export type RuntimePredictionPanelProps = {
  presentation:
    RuntimePredictivePresentation | null;
};

/* ------------------------------------------------------------------ */
/* Date Formatting                                                    */
/* ------------------------------------------------------------------ */

/**
 * 검증된 ISO 시각을 사용자에게 읽기 쉬운 형식으로 변환합니다.
 *
 * 날짜의 유효성 검증은 Presentation derivation 단계에서 이미
 * 완료되므로, 이 함수는 표시 형식만 담당합니다.
 */
function formatPredictedAt(
  value:
    string,
): string {
  return new Intl.DateTimeFormat(
    "ko-KR",
    {
      year:
        "numeric",

      month:
        "2-digit",

      day:
        "2-digit",

      hour:
        "2-digit",

      minute:
        "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Status Label                                                       */
/* ------------------------------------------------------------------ */

function getStatusLabel(
  presentation:
    RuntimePredictivePresentation,
): string {
  switch (
    presentation.status
  ) {
    case "available":
      return "Prediction available";

    case "insufficient":
      return "More evidence required";

    case "unavailable":
      return "Prediction unavailable";
  }
}

/* ------------------------------------------------------------------ */
/* Primary Item                                                       */
/* ------------------------------------------------------------------ */

function renderPrimaryItem(
  item:
    RuntimePredictivePrimaryItem | null,
) {
  if (
    item ===
    null
  ) {
    return null;
  }

  return (
    <article className="runtime-prediction-item">
      <p className="runtime-prediction-item-label">
        {item.label}
      </p>

      <strong className="runtime-prediction-item-value">
        {item.value}
      </strong>

      {item.confidence !== null && (
        <span className="runtime-prediction-item-confidence">
          Confidence{" "}
          {Math.round(
            item.confidence *
              100,
          )}
          %
        </span>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Insight                                                            */
/* ------------------------------------------------------------------ */

function renderInsight(
  heading:
    "Risk" | "Opportunity",

  insight:
    RuntimePredictiveInsight | null,
) {
  if (
    insight ===
    null
  ) {
    return null;
  }

  return (
    <article
      className={[
        "runtime-prediction-insight",
        `runtime-prediction-insight--${insight.emphasis}`,
      ].join(
        " ",
      )}
    >
      <p className="runtime-prediction-insight-kind">
        {heading}
      </p>

      <h3 className="runtime-prediction-insight-title">
        {insight.title}
      </h3>

      <p className="runtime-prediction-insight-description">
        {insight.description}
      </p>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Empty State                                                        */
/* ------------------------------------------------------------------ */

function RuntimePredictionEmptyState() {
  return (
    <section
      className={[
        "runtime-prediction-panel",
        "runtime-prediction-panel--empty",
      ].join(
        " ",
      )}
      aria-labelledby="runtime-prediction-empty-heading"
    >
      <header className="runtime-prediction-header">
        <p className="runtime-prediction-eyebrow">
          Prediction
        </p>

        <h2
          id="runtime-prediction-empty-heading"
          className="runtime-prediction-heading"
        >
          Runtime Prediction
        </h2>

        <p className="runtime-prediction-summary">
          No prediction is available yet.
        </p>
      </header>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Runtime Prediction Panel                                           */
/* ------------------------------------------------------------------ */

/**
 * RuntimePredictivePresentation을 실제 사용자 화면에 렌더링합니다.
 *
 * 이 컴포넌트는 Prediction을 계산하거나 재해석하지 않습니다.
 *
 * 다음 Presentation 정보만 표시합니다.
 *
 * - status
 * - headline
 * - summary
 * - primary prediction
 * - predicted state
 * - predicted strategy
 * - predicted runtime decision
 * - confidence
 * - risk
 * - opportunity
 * - evidence
 * - warnings
 * - prediction timestamp
 */
export function RuntimePredictionPanel({
  presentation,
}: RuntimePredictionPanelProps) {
  if (
    presentation ===
    null
  ) {
    return (
      <RuntimePredictionEmptyState />
    );
  }

  const hasPrimaryItems =
    hasRuntimePredictivePrimaryItems(
      presentation,
    );

  const hasInsights =
    presentation.risk !==
      null ||
    presentation.opportunity !==
      null;

  const confidencePercentage =
    presentation.confidence.percentage;

  const headingId =
    "runtime-prediction-heading";

  return (
    <section
      className={[
        "runtime-prediction-panel",
        `runtime-prediction-panel--${presentation.status}`,
      ].join(
        " ",
      )}
      aria-labelledby={
        headingId
      }
    >
      <header className="runtime-prediction-header">
        <div className="runtime-prediction-header-meta">
          <p className="runtime-prediction-eyebrow">
            Prediction
          </p>

          <span
            className={[
              "runtime-prediction-status",
              `runtime-prediction-status--${presentation.status}`,
            ].join(
              " ",
            )}
          >
            {getStatusLabel(
              presentation,
            )}
          </span>
        </div>

        <h2
          id={headingId}
          className="runtime-prediction-heading"
        >
          {presentation.headline}
        </h2>

        <p className="runtime-prediction-summary">
          {presentation.summary}
        </p>
      </header>

      {presentation.primaryPrediction !==
        null && (
        <section className="runtime-prediction-primary">
          <h3 className="runtime-prediction-section-title">
            Primary Prediction
          </h3>

          <p className="runtime-prediction-primary-value">
            {
              presentation.primaryPrediction
            }
          </p>
        </section>
      )}

      {hasPrimaryItems && (
        <div className="runtime-prediction-grid">
          {renderPrimaryItem(
            presentation.statePrediction,
          )}

          {renderPrimaryItem(
            presentation.strategyPrediction,
          )}

          {renderPrimaryItem(
            presentation.decisionPrediction,
          )}
        </div>
      )}

      <section className="runtime-prediction-confidence">
        <div className="runtime-prediction-confidence-header">
          <h3 className="runtime-prediction-section-title">
            Confidence
          </h3>

          {confidencePercentage !==
            null && (
            <strong className="runtime-prediction-confidence-value">
              {confidencePercentage}
              %
            </strong>
          )}
        </div>

        {confidencePercentage !==
          null && (
          <progress
            className="runtime-prediction-confidence-progress"
            value={
              confidencePercentage
            }
            max={100}
            aria-label="Prediction confidence"
          >
            {
              confidencePercentage
            }
            %
          </progress>
        )}

        <p className="runtime-prediction-confidence-disclosure">
          {
            presentation.confidence
              .disclosure
          }
        </p>
      </section>

      {hasInsights && (
        <div className="runtime-prediction-insight-grid">
          {renderInsight(
            "Risk",
            presentation.risk,
          )}

          {renderInsight(
            "Opportunity",
            presentation.opportunity,
          )}
        </div>
      )}

      {hasRuntimePredictiveEvidence(
        presentation,
      ) && (
        <section className="runtime-prediction-section">
          <h3 className="runtime-prediction-section-title">
            Evidence
          </h3>

          <ul className="runtime-prediction-list">
            {presentation.evidence.map(
              evidence => (
                <li
                  key={
                    evidence
                  }
                >
                  {evidence}
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      {hasRuntimePredictiveWarnings(
        presentation,
      ) && (
        <section
          className={[
            "runtime-prediction-section",
            "runtime-prediction-warnings",
          ].join(
            " ",
          )}
        >
          <h3 className="runtime-prediction-section-title">
            Warnings
          </h3>

          <ul className="runtime-prediction-list">
            {presentation.warnings.map(
              warning => (
                <li
                  key={
                    warning
                  }
                >
                  {warning}
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      <footer className="runtime-prediction-footer">
        <time
          dateTime={
            presentation.predictedAt
          }
        >
          Predicted at{" "}
          {formatPredictedAt(
            presentation.predictedAt,
          )}
        </time>
      </footer>
    </section>
  );
}