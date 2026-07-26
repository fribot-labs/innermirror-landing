import type { RuntimeNextAction } from "../runtime-next-action/runtimeNextActionTypes";

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
    CreateRuntimeRecommendationIntegrationResultParams,
    RuntimeRecommendationIntegrationResult,
} from "./runtimeRecommendationIntegrationTypes";

/* ------------------------------------------------------------------ */
/* Pipeline Stage */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation Integration Pipeline에서 실제로 실행되는
 * 단계를 나타냅니다.
 *
 * RuntimeNextAction은 이 파이프라인 밖의 Runtime 계층에서 생성되므로
 * 실행 단계에 포함되지 않습니다.
 */
export type RuntimeRecommendationIntegrationPipelineStage =
  | "recommendation-comparison"
  | "observation-summary"
  | "executive-summary"
  | "integration-result";

/* ------------------------------------------------------------------ */
/* Comparison Input */
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
/* Observation Summary Input */
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
/* Pipeline Policy */
/* ------------------------------------------------------------------ */

/**
 * Pipeline 내부 Summary 계층에 전달되는 정책 모음입니다.
 *
 * 각 정책은 소유 모듈의 기존 타입을 그대로 재사용합니다.
 */
export type RuntimeRecommendationIntegrationPipelinePolicy = {
  observationSummary?:
    PartialRuntimeRecommendationAdaptiveObservationSummaryPolicy;

  executiveSummary?:
    PartialRuntimeExecutiveSummaryPolicy;
};

/**
 * Pipeline 정책의 선택적 입력 형태입니다.
 */
export type PartialRuntimeRecommendationIntegrationPipelinePolicy =
  Partial<RuntimeRecommendationIntegrationPipelinePolicy>;

/* ------------------------------------------------------------------ */
/* Pipeline Input */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation Integration Pipeline의 공식 입력입니다.
 *
 * B 방식 경계:
 *
 * - RuntimeNextAction은 외부 Runtime 계층에서 이미 생성됩니다.
 * - Base Winner와 Adaptive Resolution도 외부에서 계산됩니다.
 * - Observation analytics도 외부에서 계산됩니다.
 * - Pipeline은 기존 결과를 순서대로 조합합니다.
 */
export type RunRuntimeRecommendationIntegrationParams = {
  /**
   * 기존 Runtime이 실제로 선택한 Next Action입니다.
   *
   * Recommendation Evolution Pipeline은 이 값을 생성하거나
   * 변경하지 않습니다.
   */
  runtimeNextAction:
    RuntimeNextAction | null;

  /**
   * Base Winner와 Adaptive Shadow Resolution을 비교하는 데 필요한
   * 입력입니다.
   */
  comparisonInput:
    RuntimeRecommendationIntegrationComparisonInput;

  /**
   * Adaptive Observation Summary를 생성하는 데 필요한 네 가지
   * 분석 결과입니다.
   */
  observationSummaryInput:
    RuntimeRecommendationIntegrationObservationSummaryInput;

  /**
   * Observation Summary 및 Executive Summary 생성 정책입니다.
   */
  policy?:
    PartialRuntimeRecommendationIntegrationPipelinePolicy;

  /**
   * Pipeline 전체 단계가 공유할 생성 시각입니다.
   *
   * 테스트와 회귀 검증에서는 결정적인 ISO 시각을 전달할 수 있습니다.
   */
  generatedAt?:
    string;

  /**
   * 외부 Runtime 또는 선행 분석 계층에서 생성된 경고입니다.
   *
   * 이 경고는 최종 Integration Result assembler로 전달되며,
   * 해당 assembler가 공백 제거와 중복 제거를 담당합니다.
   */
  warnings?:
    string[];
};

/* ------------------------------------------------------------------ */
/* Pipeline Intermediate Results */
/* ------------------------------------------------------------------ */

/**
 * Pipeline이 최종 Integration Result를 만들기 전까지 생성한
 * 중간 결과를 표현합니다.
 *
 * 주로 테스트, 진단 및 향후 trace 확장에 사용할 수 있습니다.
 */
export type RuntimeRecommendationIntegrationPipelineResults = {
  recommendationComparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult;

  observationSummaryResult:
    CreateAdaptiveRecommendationObservationSummaryResult;

  executiveSummaryResult:
    CreateRuntimeExecutiveSummaryResult;

  integrationResult:
    RuntimeRecommendationIntegrationResult;
};

/* ------------------------------------------------------------------ */
/* Pipeline Diagnostics */
/* ------------------------------------------------------------------ */

/**
 * Pipeline 실행 자체에 관한 최소 진단 구조입니다.
 *
 * PR-RI02의 기본 반환값은 RuntimeRecommendationIntegrationResult이지만,
 * 향후 trace 또는 개발자 진단 결과가 필요할 때 이 타입을 사용할 수
 * 있습니다.
 */
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
/* Stage Function Types */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Comparison 실행 함수의 계약입니다.
 */
export type RuntimeRecommendationComparisonRunner = (
  params: CompareBaseAndAdaptiveRuntimeRecommendationsParams
) => CompareBaseAndAdaptiveRuntimeRecommendationsResult;

/**
 * Adaptive Observation Summary 실행 함수의 계약입니다.
 */
export type RuntimeRecommendationObservationSummaryRunner = (
  params: CreateAdaptiveRecommendationObservationSummaryParams
) => CreateAdaptiveRecommendationObservationSummaryResult;

/**
 * Runtime Executive Summary 실행 함수의 계약입니다.
 */
export type RuntimeExecutiveSummaryRunner = (
  params: CreateRuntimeExecutiveSummaryParams
) => CreateRuntimeExecutiveSummaryResult;

/**
 * 최종 Runtime Recommendation Integration Result assembler의
 * 실행 계약입니다.
 */
export type RuntimeRecommendationIntegrationResultRunner = (
  params: CreateRuntimeRecommendationIntegrationResultParams
) => RuntimeRecommendationIntegrationResult;

/* ------------------------------------------------------------------ */
/* Pipeline Dependencies */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation Integration Pipeline이 사용하는 실행
 * 의존성입니다.
 *
 * 기본 실행에서는 실제 production 함수를 사용하고,
 * 테스트에서는 vi.fn() 기반 대체 함수를 주입할 수 있습니다.
 *
 * 이 구조는 Recommendation 알고리즘을 플러그인화하기 위한 것이
 * 아니라 Pipeline의 호출 순서와 데이터 전달을 독립적으로
 * 검증하기 위한 것입니다.
 */
export type RuntimeRecommendationIntegrationDependencies = {
  compareRecommendations:
    RuntimeRecommendationComparisonRunner;

  createObservationSummary:
    RuntimeRecommendationObservationSummaryRunner;

  createExecutiveSummary:
    RuntimeExecutiveSummaryRunner;

  createIntegrationResult:
    RuntimeRecommendationIntegrationResultRunner;
};

/* ------------------------------------------------------------------ */
/* Derived Stage Parameter Types */
/* ------------------------------------------------------------------ */

/**
 * Pipeline이 Comparison 단계에 실제로 전달하는 매개변수입니다.
 */
export type RuntimeRecommendationIntegrationComparisonParams =
  CompareBaseAndAdaptiveRuntimeRecommendationsParams;

/**
 * Pipeline이 Observation Summary 단계에 실제로 전달하는
 * 매개변수입니다.
 */
export type RuntimeRecommendationIntegrationObservationSummaryParams =
  CreateAdaptiveRecommendationObservationSummaryParams;

/**
 * Pipeline이 Executive Summary 단계에 실제로 전달하는
 * 매개변수입니다.
 */
export type RuntimeRecommendationIntegrationExecutiveSummaryParams =
  CreateRuntimeExecutiveSummaryParams;

/**
 * Pipeline이 최종 Integration Result 단계에 실제로 전달하는
 * 매개변수입니다.
 */
export type RuntimeRecommendationIntegrationResultParams =
  CreateRuntimeRecommendationIntegrationResultParams;

/* ------------------------------------------------------------------ */
/* Pipeline Output */
/* ------------------------------------------------------------------ */

/**
 * Pipeline의 공식 반환 타입입니다.
 *
 * PR-RI01에서 정의한 Runtime Recommendation Integration Contract를
 * 그대로 반환하며 새로운 결과 구조를 중복 정의하지 않습니다.
 */
export type RunRuntimeRecommendationIntegrationResult =
  RuntimeRecommendationIntegrationResult;

/* ------------------------------------------------------------------ */
/* Observation Summary Projection */
/* ------------------------------------------------------------------ */

/**
 * Observation Summary 생성 결과에서 Executive Summary와 최종
 * Integration Contract에 전달되는 실제 Summary 타입입니다.
 *
 * createAdaptiveRecommendationObservationSummary의 반환값 전체가
 * 아니라 result.summary가 다음 단계의 입력이 됩니다.
 */
export type RuntimeRecommendationIntegrationObservationSummary =
  RuntimeRecommendationAdaptiveObservationSummary;