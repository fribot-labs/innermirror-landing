import type {
  RuntimeEvidenceExplanation,
} from "./runtimeEvidenceTypes";
import type {
  RuntimeWhyExplanation,
} from "./runtimeWhyTypes";

export type RuntimeNextActionKind =
  | "write-reflection"
  | "analyze-github"
  | "analyze-reflection-with-github"
  | "continue-project-work"
  | "review-project-direction"
  | "stabilize-current-focus"
  | "insufficient-context";

export type RuntimeNextActionTarget =
  | "reflection"
  | "github-analysis"
  | "combined-analysis"
  | "current-focus"
  | "project-timeline"
  | "runtime-details"
  | null;

export type RuntimeNextActionConfidence =
  | "high"
  | "medium"
  | "low";

export type RuntimeNextActionSource =
  | "recommended-focus"
  | "next-interpretation"
  | "adaptive-coaching"
  | "decision-review"
  | "next-question"
  | "project-state"
  | "fallback";

export type RuntimeNextAction = {
  kind: RuntimeNextActionKind;

  title: string;
  description: string;
  reason: string;

  why?: RuntimeWhyExplanation;
  evidence?: RuntimeEvidenceExplanation;

  target: RuntimeNextActionTarget;
  confidence: RuntimeNextActionConfidence;

  source: RuntimeNextActionSource;
  sourceLabel: string;

  isActionable: boolean;
};

export type CreateRuntimeNextActionParams = {
  hasProject: boolean;
  hasRepository: boolean;
  hasReflectionDraft: boolean;
  hasGitHubSnapshot: boolean;

  currentFocus: string | null;

  recommendedFocus: string | null;
  nextInterpretation: string | null;
  adaptiveCoaching: string | null;
  decisionReviewQuestion: string | null;
  nextQuestion: string | null;

  recentCommitCount: number;
  recentPullRequestCount: number;
  reflectionCount: number;
  connectedEventCount: number;
};