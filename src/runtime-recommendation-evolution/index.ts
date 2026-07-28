/* ------------------------------------------------------------------ */
/* Recommendation Adaptive Learning Public Boundary                   */
/* ------------------------------------------------------------------ */

/**
 * Primary Orchestrator
 *
 * Adaptive Learning 전체 Pipeline을 실행하는 공식 진입점입니다.
 */
export {
    summarizeRecommendationAdaptiveLearningUpdate, updateRecommendationAdaptiveLearning
} from "./updateRecommendationAdaptiveLearning";

/**
 * Presentation View
 *
 * Landing 또는 상위 UI에서 사용할 수 있는 파생 Presentation을
 * 생성합니다.
 */
export {
    createRecommendationAdaptiveLearningPresentationView
} from "./createRecommendationAdaptiveLearningPresentation";

/**
 * Public Contracts
 *
 * 외부 모듈이 입력과 결과를 안전하게 다루기 위해 필요한
 * 최소 계약만 공개합니다.
 */
export type {
    RecommendationAdaptiveLearningAnalysis,
    RecommendationAdaptiveLearningPresentation,
    RecommendationAdaptiveLearningUpdateResult,
    RecommendationRuntimeAdjustment,
    UpdateRecommendationAdaptiveLearningParams
} from "./recommendationAdaptiveLearningTypes";

export type {
    RecommendationAdaptiveLearningPresentationView
} from "./createRecommendationAdaptiveLearningPresentation";
