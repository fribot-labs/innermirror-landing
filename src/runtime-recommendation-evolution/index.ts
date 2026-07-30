/* ------------------------------------------------------------------ */
/* Recommendation Adaptive Learning Public Boundary                   */
/* ------------------------------------------------------------------ */

/**
 * Primary Orchestrator
 *
 * Adaptive Learning 전체 Pipeline을 실행하는 공식 진입점입니다.
 */
export {
    summarizeRecommendationAdaptiveLearningUpdate,
    updateRecommendationAdaptiveLearning
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

/* ------------------------------------------------------------------ */
/* Recommendation Predictive Intelligence Public Boundary             */
/* ------------------------------------------------------------------ */

/**
 * Primary Orchestrator
 *
 * Predictive Intelligence 전체 Pipeline을 실행하고 검증된 Analysis와
 * Presentation을 함께 반환하는 공식 진입점입니다.
 *
 * 외부 Runtime과 PBL Integration은 개별 Prediction Builder,
 * Analyzer 또는 Normalizer를 직접 호출하지 않고 이 Orchestrator를
 * 통해서만 Predictive Update를 수행합니다.
 */
export {
    updateRecommendationPredictiveIntelligence
} from "./updateRecommendationPredictiveIntelligence";

/**
 * Public Contracts
 *
 * 외부 Runtime이 Predictive Intelligence를 실행하고 결과를
 * 소비하는 데 필요한 최소 계약만 공개합니다.
 *
 * Presentation 생성 함수는 공개하지 않습니다.
 * 검증된 Presentation은 Predictive Intelligence Update Result에
 * 포함된 값을 사용합니다.
 */
export type {
    RecommendationPredictiveIntelligence, RecommendationPredictiveIntelligenceUpdateResult, RecommendationPredictivePresentation, UpdateRecommendationPredictiveIntelligenceParams
} from "./recommendationPredictiveIntelligenceTypes";

