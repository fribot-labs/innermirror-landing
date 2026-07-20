import type {
  RuntimeNextAction,
  RuntimeNextActionConfidence,
  RuntimeNextActionKind,
  RuntimeNextActionSource,
  RuntimeNextActionTarget,
} from "./runtimeNextActionTypes";

export type RuntimeRecommendationCategory =
  | "context-recovery"
  | "reflection"
  | "project-direction"
  | "project-stabilization"
  | "project-review"
  | "continuity"
  | "fallback";

export type RuntimeRecommendationSpecificity =
  | "low"
  | "medium"
  | "high";

export type RuntimeRecommendationResolutionType =
  | "single"
  | "selected"
  | "merged"
  | "fallback";

export type RuntimeRecommendationCandidate = {
  id: string;

  kind: RuntimeNextActionKind;
  category: RuntimeRecommendationCategory;

  title: string;
  description: string;
  reason: string;

  target: RuntimeNextActionTarget;
  confidence: RuntimeNextActionConfidence;

  source: RuntimeNextActionSource;
  sourceLabel: string;

  isActionable: boolean;

  /**
   * 현재 작업을 진행하기 전에 반드시 해결해야 하는
   * 상태 결손인지 나타냅니다.
   */
  isBlocking: boolean;

  /**
   * 규칙 자체의 기본 중요도입니다.
   * 최종 점수가 아니라 engine 입력값입니다.
   */
  basePriority: number;

  /**
   * 얼마나 구체적인 행동인지 나타냅니다.
   */
  specificity: RuntimeRecommendationSpecificity;
};

export type ScoredRuntimeRecommendationCandidate = {
  candidate: RuntimeRecommendationCandidate;
  score: number;
  scoreReasons: string[];
};

export type RuntimeRecommendationResolution = {
  action: RuntimeNextAction;
  selectedCandidateId: string;
  candidateCount: number;
  supportingCandidateIds: string[];
  resolution:
    RuntimeRecommendationResolutionType;
};