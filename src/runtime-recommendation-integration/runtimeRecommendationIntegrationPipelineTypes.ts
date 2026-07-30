import type {
  RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

import type {
  CompareBaseAndAdaptiveRuntimeRecommendationsParams,
  CompareBaseAndAdaptiveRuntimeRecommendationsResult,
} from "../runtime-recommendation-evolution/compareBaseAndAdaptiveRuntimeRecommendations";

import type {
  CreateAdaptiveRecommendationObservationSummaryParams,
  CreateAdaptiveRecommendationObservationSummaryResult,
  PartialRuntimeRecommendationAdaptiveObservationSummaryPolicy,
  RuntimeRecommendationAdaptiveObservationSummary,
} from "../runtime-recommendation-evolution/createAdaptiveRecommendationObservationSummary";

import type {
  CreateRuntimeExecutiveSummaryParams,
  CreateRuntimeExecutiveSummaryResult,
  PartialRuntimeExecutiveSummaryPolicy,
} from "../runtime-recommendation-evolution/createRuntimeExecutiveSummary";

import type {
  RecommendationPredictiveIntelligenceUpdateResult,
  UpdateRecommendationPredictiveIntelligenceParams,
} from "../runtime-recommendation-evolution";

import type {
  CreateRuntimeRecommendationIntegrationResultParams,
  RuntimeRecommendationIntegrationResult,
} from "./runtimeRecommendationIntegrationTypes";

/* ------------------------------------------------------------------ */
/* Pipeline Stage                                                     */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation Integration Pipeline에서 실제로 실행되는
 * 단계를 나타냅니다.
 *
 * RuntimeNextAction은 이 Pipeline 밖의 Runtime 계층에서 생성되므로
 * 실행 단계에 포함되지 않습니다.
 */
export type RuntimeRecommendationIntegrationPipelineStage =
  | "recommendation-comparison"
  | "observation-summary"
  | "executive-summary"
  | "predictive-intelligence"
  | "integration-result";

/* ------------------------------------------------------------------ */
/* Comparison Input                                                   */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Comparison 단계의 입력입니다.
 *
 * generatedAt은 Pipeline 전체에서 하나의 정규화된 시각을 사용하므로
 * 외부 입력에서 제외하고 Pipeline이 직접 공급합니다.
 */
export type RuntimeRecommendationIntegrationComparisonInput =
  Omit<
    CompareBaseAndAdaptiveRuntimeRecommendationsParams,
    "generatedAt"
  >;

/* ------------------------------------------------------------------ */
/* Observation Summary Input                                          */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Observation Summary 단계의 분석 소스입니다.
 *
 * 현재 createAdaptiveRecommendationObservationSummary 함수는
 * Recommendation Comparison을 직접 입력받지 않습니다.
 *
 * 대신 이미 계산된 다음 네 가지 분석 결과를 받습니다.
 *
 * - statistics
 * - stability
 * - drift
 * - confidence
 */
export type RuntimeRecommendationIntegrationObservationSummaryInput =
  Omit<
    CreateAdaptiveRecommendationObservationSummaryParams,
    "policy" | "generatedAt"
  >;

/* ------------------------------------------------------------------ */
/* Predictive Intelligence Input                                      */
/* ------------------------------------------------------------------ */

/**
 * Predictive Intelligence 단계가 받는 Pipeline 입력입니다.
 *
 * predictedAt은 Pipeline 전체가 공유하는 normalized generatedAt을
 * 사용하므로 외부 입력에서 제외합니다.
 *
 * Prediction ID Factory는 Pipeline이 일관된 규칙으로 공급하므로
 * 외부 호출자가 직접 전달하지 않습니다.
 */
export type RuntimeRecommendationPredictiveInput =
  Omit<
    UpdateRecommendationPredictiveIntelligenceParams,
    | "predictedAt"
    | "createStatePredictionId"
    | "createStrategyPredictionId"
    | "createDecisionPredictionId"
    | "createRiskPredictionId"
    | "createOpportunityPredictionId"
    | "createConflictId"
    | "createSignalId"
  >;

/* ------------------------------------------------------------------ */
/* Pipeline Policy                                                    */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationIntegrationPipelinePolicy = {
  observationSummary?:
    PartialRuntimeRecommendationAdaptiveObservationSummaryPolicy;

  executiveSummary?:
    PartialRuntimeExecutiveSummaryPolicy;
};

export type PartialRuntimeRecommendationIntegrationPipelinePolicy =
  Partial<
    RuntimeRecommendationIntegrationPipelinePolicy
  >;

/* ------------------------------------------------------------------ */
/* Pipeline Input                                                     */
/* ------------------------------------------------------------------ */

export type RunRuntimeRecommendationIntegrationParams = {
  runtimeNextAction:
    RuntimeNextAction | null;

  comparisonInput:
    RuntimeRecommendationIntegrationComparisonInput;

  observationSummaryInput:
    RuntimeRecommendationIntegrationObservationSummaryInput;

  /**
   * null이면 Prediction 단계를 실행하지 않고,
   * Integration Result에 null을 전달합니다.
   */
  predictiveInput:
    RuntimeRecommendationPredictiveInput | null;

  policy?:
    PartialRuntimeRecommendationIntegrationPipelinePolicy;

  generatedAt?:
    string;

  warnings?:
    string[];
};

/* ------------------------------------------------------------------ */
/* Pipeline Intermediate Results                                      */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationIntegrationPipelineResults = {
  recommendationComparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult;

  observationSummaryResult:
    CreateAdaptiveRecommendationObservationSummaryResult;

  executiveSummaryResult:
    CreateRuntimeExecutiveSummaryResult;

  predictiveIntelligenceResult:
    RecommendationPredictiveIntelligenceUpdateResult | null;

  integrationResult:
    RuntimeRecommendationIntegrationResult;
};

/* ------------------------------------------------------------------ */
/* Pipeline Diagnostics                                               */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationIntegrationPipelineDiagnostics = {
  generatedAt:
    string;

  completedStages:
    RuntimeRecommendationIntegrationPipelineStage[];

  completedStageCount:
    number;

  totalStageCount:
    number;
};

/* ------------------------------------------------------------------ */
/* Stage Function Types                                               */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationComparisonRunner = (
  params:
    CompareBaseAndAdaptiveRuntimeRecommendationsParams
) => CompareBaseAndAdaptiveRuntimeRecommendationsResult;

export type RuntimeRecommendationObservationSummaryRunner = (
  params:
    CreateAdaptiveRecommendationObservationSummaryParams
) => CreateAdaptiveRecommendationObservationSummaryResult;

export type RuntimeExecutiveSummaryRunner = (
  params:
    CreateRuntimeExecutiveSummaryParams
) => CreateRuntimeExecutiveSummaryResult;

export type RuntimeRecommendationPredictiveIntelligenceRunner = (
  params:
    UpdateRecommendationPredictiveIntelligenceParams
) => RecommendationPredictiveIntelligenceUpdateResult;

export type RuntimeRecommendationIntegrationResultRunner = (
  params:
    CreateRuntimeRecommendationIntegrationResultParams
) => RuntimeRecommendationIntegrationResult;

/* ------------------------------------------------------------------ */
/* Pipeline Dependencies                                              */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationIntegrationDependencies = {
  compareRecommendations:
    RuntimeRecommendationComparisonRunner;

  createObservationSummary:
    RuntimeRecommendationObservationSummaryRunner;

  createExecutiveSummary:
    RuntimeExecutiveSummaryRunner;

  updatePredictiveIntelligence:
    RuntimeRecommendationPredictiveIntelligenceRunner;

  createIntegrationResult:
    RuntimeRecommendationIntegrationResultRunner;
};

/* ------------------------------------------------------------------ */
/* Derived Stage Parameter Types                                      */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationIntegrationComparisonParams =
  CompareBaseAndAdaptiveRuntimeRecommendationsParams;

export type RuntimeRecommendationIntegrationObservationSummaryParams =
  CreateAdaptiveRecommendationObservationSummaryParams;

export type RuntimeRecommendationIntegrationExecutiveSummaryParams =
  CreateRuntimeExecutiveSummaryParams;

export type RuntimeRecommendationIntegrationPredictiveParams =
  UpdateRecommendationPredictiveIntelligenceParams;

export type RuntimeRecommendationIntegrationResultParams =
  CreateRuntimeRecommendationIntegrationResultParams;

/* ------------------------------------------------------------------ */
/* Pipeline Output                                                    */
/* ------------------------------------------------------------------ */

export type RunRuntimeRecommendationIntegrationResult =
  RuntimeRecommendationIntegrationResult;

/* ------------------------------------------------------------------ */
/* Observation Summary Projection                                     */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationIntegrationObservationSummary =
  RuntimeRecommendationAdaptiveObservationSummary;