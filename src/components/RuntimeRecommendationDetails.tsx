import type {
    RuntimeRecommendationPresentation,
} from "./runtimeRecommendationPresentation";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationDetailsProps = {
  presentation:
    RuntimeRecommendationPresentation;
};

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation Integration 결과의 세부 분석 정보를
 * 접을 수 있는 Advanced Details 영역으로 표시합니다.
 *
 * 기본 Summary에서는 사용자에게 필요한 핵심 흐름만 보여주고,
 * 이 컴포넌트에서는 다음과 같은 보조 정보를 제공합니다.
 *
 * - Base / Adaptive Recommendation
 * - Observation Count
 * - Primary Signal
 * - Primary Risk
 * - Integration Status
 * - Completed Stages
 * - Warnings
 *
 * 원시 점수, 내부 정책 객체, 전체 Diagnostics JSON은 표시하지 않습니다.
 */
export function RuntimeRecommendationDetails({
  presentation,
}: RuntimeRecommendationDetailsProps) {
  const hasRecommendationCandidates =
    presentation.baseRecommendationLabel !== null ||
    presentation.adaptiveRecommendationLabel !== null;

  const hasPrimarySignal =
    presentation.primarySignalTitle !== null ||
    presentation.primarySignalDescription !== null;

  const hasPrimaryRisk =
    presentation.primaryRiskTitle !== null ||
    presentation.primaryRiskDescription !== null;

  const hasWarnings =
    presentation.warnings.length > 0;

  return (
    <details className="recommendation-details">
      <summary className="recommendation-details-summary">
        View recommendation analysis
      </summary>

      <div className="recommendation-details-content">
        <section
          className="recommendation-details-section"
          aria-labelledby={
            "runtime-recommendation-status-heading"
          }
        >
          <h3
            id="runtime-recommendation-status-heading"
            className="recommendation-details-heading"
          >
            Analysis status
          </h3>

          <dl className="recommendation-details-list">
            <div className="recommendation-details-row">
              <dt>Status</dt>

              <dd>
                {presentation.integrationStatusLabel}
              </dd>
            </div>

            <div className="recommendation-details-row">
              <dt>Reason</dt>

              <dd>
                {presentation.integrationReasonLabel}
              </dd>
            </div>

            <div className="recommendation-details-row">
              <dt>Pipeline</dt>

              <dd>
                {presentation.completedStageLabel}
              </dd>
            </div>
          </dl>
        </section>

        {hasRecommendationCandidates ? (
          <section
            className="recommendation-details-section"
            aria-labelledby={
              "runtime-recommendation-candidates-heading"
            }
          >
            <h3
              id="runtime-recommendation-candidates-heading"
              className="recommendation-details-heading"
            >
              Recommendation comparison
            </h3>

            <dl className="recommendation-details-list">
              {presentation.baseRecommendationLabel !== null ? (
                <div className="recommendation-details-row">
                  <dt>Base recommendation</dt>

                  <dd>
                    {presentation.baseRecommendationLabel}
                  </dd>
                </div>
              ) : null}

              {presentation.adaptiveRecommendationLabel !== null ? (
                <div className="recommendation-details-row">
                  <dt>Adaptive recommendation</dt>

                  <dd>
                    {presentation.adaptiveRecommendationLabel}
                  </dd>
                </div>
              ) : null}

              <div className="recommendation-details-row">
                <dt>Comparison</dt>

                <dd>
                  {
                    presentation
                      .recommendationChangeMessage
                  }
                </dd>
              </div>
            </dl>
          </section>
        ) : null}

        <section
          className="recommendation-details-section"
          aria-labelledby={
            "runtime-recommendation-observations-heading"
          }
        >
          <h3
            id="runtime-recommendation-observations-heading"
            className="recommendation-details-heading"
          >
            Observation evidence
          </h3>

          <p className="recommendation-details-description">
            {presentation.observationCountLabel}
          </p>

          <dl className="recommendation-details-list">
            {presentation.observationCount !== null ? (
              <div className="recommendation-details-row">
                <dt>Total observations</dt>

                <dd>
                  {presentation.observationCount}
                </dd>
              </div>
            ) : null}

            {presentation.comparableObservationCount !== null ? (
              <div className="recommendation-details-row">
                <dt>Comparable observations</dt>

                <dd>
                  {
                    presentation
                      .comparableObservationCount
                  }
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        {hasPrimarySignal ? (
          <section
            className="recommendation-details-section"
            aria-labelledby={
              "runtime-recommendation-signal-heading"
            }
          >
            <h3
              id="runtime-recommendation-signal-heading"
              className="recommendation-details-heading"
            >
              Primary signal
            </h3>

            <div className="recommendation-analysis-card">
              {presentation.primarySignalTitle !== null ? (
                <strong>
                  {presentation.primarySignalTitle}
                </strong>
              ) : null}

              {presentation.primarySignalDescription !== null ? (
                <p>
                  {
                    presentation
                      .primarySignalDescription
                  }
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {hasPrimaryRisk ? (
          <section
            className={
              [
                "recommendation-details-section",
                "recommendation-details-section--risk",
              ].join(" ")
            }
            aria-labelledby={
              "runtime-recommendation-risk-heading"
            }
          >
            <h3
              id="runtime-recommendation-risk-heading"
              className="recommendation-details-heading"
            >
              Primary risk
            </h3>

            <div
              className={
                [
                  "recommendation-analysis-card",
                  "recommendation-analysis-card--risk",
                ].join(" ")
              }
            >
              {presentation.primaryRiskTitle !== null ? (
                <strong>
                  {presentation.primaryRiskTitle}
                </strong>
              ) : null}

              {presentation.primaryRiskDescription !== null ? (
                <p>
                  {
                    presentation
                      .primaryRiskDescription
                  }
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {hasWarnings ? (
          <section
            className={
              [
                "recommendation-details-section",
                "recommendation-details-section--warnings",
              ].join(" ")
            }
            aria-labelledby={
              "runtime-recommendation-warnings-heading"
            }
          >
            <h3
              id="runtime-recommendation-warnings-heading"
              className="recommendation-details-heading"
            >
              Analysis notes
            </h3>

            <ul className="recommendation-warning-list">
              {presentation.warnings.map(
                (
                  warning,
                  index
                ) => (
                  <li
                    key={
                      `${index}-${warning}`
                    }
                  >
                    {warning}
                  </li>
                )
              )}
            </ul>
          </section>
        ) : null}
      </div>
    </details>
  );
}