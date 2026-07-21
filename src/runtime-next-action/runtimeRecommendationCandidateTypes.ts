import type {
  RuntimeCandidateEvidence,
} from "./runtimeEvidenceTypes";

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
  isBlocking: boolean;

  basePriority: number;
  specificity:
    RuntimeRecommendationSpecificity;

  /**
   * Candidate가 생성된 실제 프로젝트 상태와
   * Runtime 신호를 구조화해서 보존합니다.
   *
   * PR-044A에서는 점진적 마이그레이션을 위해 optional입니다.
   * 모든 rule에 Evidence가 추가되는 PR-044B 마지막에는
   * 필수 필드로 전환합니다.
   */
  evidence?:
    RuntimeCandidateEvidence[];
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