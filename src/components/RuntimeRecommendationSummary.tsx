import type {
    RuntimeRecommendationPresentation,
} from "./runtimeRecommendationPresentation";

/* ------------------------------------------------------------------ */
/* Props */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationSummaryProps = {
  presentation:
    RuntimeRecommendationPresentation;
};

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation Integration 결과의 핵심 내용을
 * 사용자에게 간결하게 표시합니다.
 *
 * 이 컴포넌트는 Runtime 내부 계약을 직접 해석하지 않습니다.
 * 모든 enum 변환과 nullable 처리는
 * createRuntimeRecommendationPresentation()에서 완료됩니다.
 *
 * 표시 우선순위:
 *
 * 1. Executive Summary
 * 2. Recommendation 상태
 * 3. Confidence / Stability / Drift
 * 4. Recommendation 변화 설명
 * 5. Next Focus
 *
 * 상세 Observation 및 Diagnostics는 별도의
 * RuntimeRecommendationDetails 컴포넌트가 담당합니다.
 */
export function RuntimeRecommendationSummary({
  presentation,
}: RuntimeRecommendationSummaryProps) {
  return (
    <section
      className={
        [
          "recommendation-summary",
          `recommendation-summary--${presentation.tone}`,
        ].join(" ")
      }
      aria-labelledby={
        "runtime-recommendation-summary-title"
      }
    >
      <header className="recommendation-summary-header">
        <span className="recommendation-summary-eyebrow">
          Runtime Recommendation
        </span>

        <strong
          id="runtime-recommendation-summary-title"
          className="recommendation-summary-headline"
        >
          {presentation.headline}
        </strong>
      </header>

      <p className="recommendation-summary-overview">
        {presentation.overview}
      </p>

      <div className="recommendation-summary-state">
        <span className="recommendation-summary-state-label">
          Current state
        </span>

        <strong>
          {presentation.recommendationStateLabel}
        </strong>
      </div>

      <dl className="recommendation-summary-signals">
        <div className="recommendation-summary-signal">
          <dt>Confidence</dt>

          <dd>
            {presentation.confidenceLabel}
          </dd>
        </div>

        <div className="recommendation-summary-signal">
          <dt>Stability</dt>

          <dd>
            {presentation.stabilityLabel}
          </dd>
        </div>

        <div className="recommendation-summary-signal">
          <dt>Drift</dt>

          <dd>
            {presentation.driftLabel}
          </dd>
        </div>
      </dl>

      <p className="recommendation-summary-change">
        {presentation.recommendationChangeMessage}
      </p>

      {presentation.nextFocus !== null ? (
        <div className="recommendation-next-focus">
          <span className="recommendation-next-focus-label">
            Next focus
          </span>

          <p>
            {presentation.nextFocus}
          </p>
        </div>
      ) : null}

      <footer className="recommendation-summary-footer">
        <span
          className={
            [
              "recommendation-status-badge",
              `recommendation-status-badge--${presentation.tone}`,
            ].join(" ")
          }
        >
          {presentation.integrationStatusLabel}
        </span>
      </footer>
    </section>
  );
}