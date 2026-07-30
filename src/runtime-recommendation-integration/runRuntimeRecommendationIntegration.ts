import {
  compareBaseAndAdaptiveRuntimeRecommendations,
} from "../runtime-recommendation-evolution/compareBaseAndAdaptiveRuntimeRecommendations";

import {
  createAdaptiveRecommendationObservationSummary,
} from "../runtime-recommendation-evolution/createAdaptiveRecommendationObservationSummary";

import {
  createRuntimeExecutiveSummary,
} from "../runtime-recommendation-evolution/createRuntimeExecutiveSummary";

import {
  normalizeGeneratedAt,
} from "../runtime-recommendation-evolution/runtimeRecommendationMath";

import {
  updateRecommendationPredictiveIntelligence,
} from "../runtime-recommendation-evolution";

import {
  createRuntimeRecommendationIntegrationResult,
} from "./createRuntimeRecommendationIntegrationResult";

import type {
  RunRuntimeRecommendationIntegrationParams,
  RunRuntimeRecommendationIntegrationResult,
  RuntimeRecommendationIntegrationDependencies,
  RuntimeRecommendationIntegrationPipelineResults,
} from "./runtimeRecommendationIntegrationPipelineTypes";

/* ------------------------------------------------------------------ */
/* Default Dependencies                                               */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation Integration Pipeline에서 사용하는 기본
 * production 의존성입니다.
 *
 * 테스트에서는 이 객체 대신 vi.fn() 기반 의존성을 두 번째 인수로
 * 전달하여 호출 순서와 단계별 데이터 전달을 검증할 수 있습니다.
 */
export const DEFAULT_RUNTIME_RECOMMENDATION_INTEGRATION_DEPENDENCIES:
  RuntimeRecommendationIntegrationDependencies = {
    compareRecommendations:
      compareBaseAndAdaptiveRuntimeRecommendations,

    createObservationSummary:
      createAdaptiveRecommendationObservationSummary,

    createExecutiveSummary:
      createRuntimeExecutiveSummary,

    updatePredictiveIntelligence:
      updateRecommendationPredictiveIntelligence,

    createIntegrationResult:
      createRuntimeRecommendationIntegrationResult,
  };

/* ------------------------------------------------------------------ */
/* Public Pipeline API                                                */
/* ------------------------------------------------------------------ */

/**
 * 기존 Runtime과 Recommendation Evolution 사이의 내부 Pipeline을
 * 실행합니다.
 *
 * B 방식 경계:
 *
 * - RuntimeNextAction은 외부 Runtime 계층에서 이미 생성됩니다.
 * - Base Winner와 Adaptive Resolution도 외부에서 계산됩니다.
 * - Observation Statistics, Stability, Drift, Confidence도 외부에서
 *   계산됩니다.
 * - Predictive Intelligence는 Memory, Memory Analysis 및
 *   Adaptive Learning Analysis가 제공될 때만 실행됩니다.
 * - 이 Pipeline은 기존 도메인 결과를 변경하지 않고 순서대로
 *   실행하고 조합합니다.
 *
 * 실행 순서:
 *
 * 1. Base / Adaptive Recommendation Comparison
 * 2. Adaptive Observation Summary
 * 3. Runtime Executive Summary
 * 4. Recommendation Predictive Intelligence
 * 5. Runtime Recommendation Integration Result
 *
 * predictiveInput이 null이면 Predictive Intelligence 실행을
 * 생략하며 Integration Result에는 null을 전달합니다.
 *
 * 예상 가능한 데이터 부족은 각 도메인 결과의 partial 또는
 * insufficient-data 상태로 표현합니다.
 *
 * 도메인 함수가 예상하지 못한 오류를 throw하는 경우에는 오류를
 * 숨기지 않고 호출자에게 그대로 전달합니다.
 */
export function runRuntimeRecommendationIntegration(
  params:
    RunRuntimeRecommendationIntegrationParams,

  dependencies:
    RuntimeRecommendationIntegrationDependencies =
      DEFAULT_RUNTIME_RECOMMENDATION_INTEGRATION_DEPENDENCIES,
): RunRuntimeRecommendationIntegrationResult {
  const pipelineResults =
    executeRuntimeRecommendationIntegrationPipeline(
      params,
      dependencies,
    );

  return pipelineResults.integrationResult;
}

/* ------------------------------------------------------------------ */
/* Pipeline Execution                                                 */
/* ------------------------------------------------------------------ */

/**
 * Pipeline의 모든 중간 결과를 반환하는 내부 실행 함수입니다.
 *
 * 기본 공개 API는 최종 Integration Result만 반환하지만,
 * 이 함수는 다음 목적에 사용할 수 있습니다.
 *
 * - 단위 테스트
 * - 개발자 진단
 * - 향후 Pipeline trace 확장
 * - 단계별 결과 회귀 검증
 */
export function executeRuntimeRecommendationIntegrationPipeline(
  {
    runtimeNextAction,
    comparisonInput,
    observationSummaryInput,
    predictiveInput,
    policy,
    generatedAt,
    warnings,
  }:
    RunRuntimeRecommendationIntegrationParams,

  dependencies:
    RuntimeRecommendationIntegrationDependencies =
      DEFAULT_RUNTIME_RECOMMENDATION_INTEGRATION_DEPENDENCIES,
): RuntimeRecommendationIntegrationPipelineResults {
  validateRuntimeRecommendationIntegrationDependencies(
    dependencies,
  );

  const normalizedGeneratedAt =
    normalizeGeneratedAt(
      generatedAt,
    );

  /*
   * Stage 1 — Recommendation Comparison
   *
   * Base Winner와 Adaptive Shadow Resolution을 비교합니다.
   * RuntimeNextAction은 이 단계에서 생성하거나 변경하지 않습니다.
   */
  const recommendationComparison =
    dependencies.compareRecommendations({
      ...comparisonInput,

      generatedAt:
        normalizedGeneratedAt,
    });

  /*
   * Stage 2 — Observation Summary
   *
   * 현재 구현의 Observation Summary는 Recommendation Comparison을
   * 직접 입력받지 않습니다.
   *
   * 외부에서 이미 계산된 다음 분석 결과를 요약합니다.
   *
   * - statistics
   * - stability
   * - drift
   * - confidence
   */
  const observationSummaryResult =
    dependencies.createObservationSummary({
      ...observationSummaryInput,

      policy:
        policy?.observationSummary,

      generatedAt:
        normalizedGeneratedAt,
    });

  /*
   * Stage 3 — Executive Summary
   *
   * Observation Summary 생성 결과 전체가 아니라
   * observationSummaryResult.summary를 전달해야 합니다.
   */
  const executiveSummaryResult =
    dependencies.createExecutiveSummary({
      runtimeNextAction,

      recommendationComparison,

      observationSummary:
        observationSummaryResult.summary,

      policy:
        policy?.executiveSummary,

      generatedAt:
        normalizedGeneratedAt,
    });

  /*
   * Stage 4 — Predictive Intelligence
   *
   * predictiveInput이 null이면 Predictive Intelligence를 실행하지
   * 않고 null을 유지합니다.
   *
   * 입력이 존재하면 REI06 Public API를 통해 실제 Prediction
   * Pipeline을 실행합니다.
   *
   * predictedAt은 Pipeline 전체가 공유하는 normalizedGeneratedAt을
   * 사용합니다.
   *
   * Prediction ID Factory는 Runtime Integration 계층이 공급합니다.
   * 외부 호출자는 Prediction의 분석 입력만 제공합니다.
   */
  const predictiveIntelligenceResult =
    predictiveInput ===
      null
      ? null
      : dependencies.updatePredictiveIntelligence({
          ...predictiveInput,

          predictedAt:
            normalizedGeneratedAt,

          createStatePredictionId: (
            state,
            index,
          ) =>
            createRuntimePredictiveIdentifier({
              category:
                "state",

              value:
                state,

              index,

              predictedAt:
                normalizedGeneratedAt,
            }),

          createStrategyPredictionId: (
            strategyType,
            index,
          ) =>
            createRuntimePredictiveIdentifier({
              category:
                "strategy",

              value:
                strategyType,

              index,

              predictedAt:
                normalizedGeneratedAt,
            }),

          createDecisionPredictionId: (
            decisionType,
            index,
          ) =>
            createRuntimePredictiveIdentifier({
              category:
                "decision",

              value:
                decisionType,

              index,

              predictedAt:
                normalizedGeneratedAt,
            }),

          createRiskPredictionId: (
            riskType,
            index,
          ) =>
            createRuntimePredictiveIdentifier({
              category:
                "risk",

              value:
                riskType,

              index,

              predictedAt:
                normalizedGeneratedAt,
            }),

          createOpportunityPredictionId: (
            opportunityType,
            index,
          ) =>
            createRuntimePredictiveIdentifier({
              category:
                "opportunity",

              value:
                opportunityType,

              index,

              predictedAt:
                normalizedGeneratedAt,
            }),

          createConflictId: (
            conflictType,
            index,
          ) =>
            createRuntimePredictiveIdentifier({
              category:
                "conflict",

              value:
                conflictType,

              index,

              predictedAt:
                normalizedGeneratedAt,
            }),

          createSignalId: (
            signalType,
            index,
          ) =>
            createRuntimePredictiveIdentifier({
              category:
                "signal",

              value:
                signalType,

              index,

              predictedAt:
                normalizedGeneratedAt,
            }),
        });

  /*
   * Stage 5 — Integration Result
   *
   * PR-RI01에서 정의한 공식 Integration Contract를 조립합니다.
   *
   * Predictive Intelligence가 실행되었다면 도메인 결과 전체를
   * 변경하거나 flatten하지 않고 그대로 전달합니다.
   *
   * Predictive 입력이 없었다면 null을 전달하여 기존 Runtime
   * 동작과의 호환성을 유지합니다.
   *
   * Pipeline은 warnings를 정규화하지 않습니다.
   * 공백 제거와 중복 제거는 Integration Result assembler의
   * 책임입니다.
   */
  const integrationResult =
    dependencies.createIntegrationResult({
      runtimeNextAction,

      recommendationComparison,

      observationSummary:
        observationSummaryResult.summary,

      executiveSummaryResult,

      predictiveIntelligenceResult,

      generatedAt:
        normalizedGeneratedAt,

      warnings,
    });

  return {
    recommendationComparison,

    observationSummaryResult,

    executiveSummaryResult,

    predictiveIntelligenceResult,

    integrationResult,
  };
}

/* ------------------------------------------------------------------ */
/* Predictive Identifier                                              */
/* ------------------------------------------------------------------ */

/**
 * Runtime Integration에서 생성되는 Predictive artifact의 식별자를
 * 만듭니다.
 *
 * 동일한 Pipeline 실행에서는 하나의 predictedAt을 공유하며,
 * category, index 및 Prediction 값을 결합해 단계별 식별자를
 * 구분합니다.
 */
function createRuntimePredictiveIdentifier({
  category,
  value,
  index,
  predictedAt,
}: {
  category:
    | "state"
    | "strategy"
    | "decision"
    | "risk"
    | "opportunity"
    | "conflict"
    | "signal";

  value:
    string;

  index:
    number;

  predictedAt:
    string;
}): string {
  const normalizedTimestamp =
    predictedAt.replace(
      /[^0-9A-Za-z]/g,
      "",
    );

  return [
    "runtime-predictive",
    normalizedTimestamp,
    category,
    index,
    value,
  ].join(
    "-",
  );
}

/* ------------------------------------------------------------------ */
/* Dependency Validation                                              */
/* ------------------------------------------------------------------ */

/**
 * 의존성 주입 객체가 실행 가능한 함수들로 구성되었는지 확인합니다.
 *
 * 일반 production 호출에서는 기본 의존성이 사용되므로 이 검증이
 * 실패하지 않습니다.
 *
 * 주로 테스트 또는 향후 대체 구현 주입 시 잘못된 dependency 객체를
 * 조기에 발견하기 위한 안전장치입니다.
 */
function validateRuntimeRecommendationIntegrationDependencies(
  dependencies:
    RuntimeRecommendationIntegrationDependencies,
): void {
  const dependencyEntries = [
    [
      "compareRecommendations",
      dependencies.compareRecommendations,
    ],
    [
      "createObservationSummary",
      dependencies.createObservationSummary,
    ],
    [
      "createExecutiveSummary",
      dependencies.createExecutiveSummary,
    ],
    [
      "updatePredictiveIntelligence",
      dependencies.updatePredictiveIntelligence,
    ],
    [
      "createIntegrationResult",
      dependencies.createIntegrationResult,
    ],
  ] as const;

  for (
    const [
      dependencyName,
      dependency,
    ] of dependencyEntries
  ) {
    if (
      typeof dependency !==
      "function"
    ) {
      throw new Error(
        [
          "Runtime Recommendation Integration Pipeline received an invalid dependency.",
          `dependency="${dependencyName}"`,
        ].join(
          " ",
        ),
      );
    }
  }
}