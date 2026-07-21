import type {
    RuntimeNextActionConfidence,
    RuntimeNextActionKind,
    RuntimeNextActionSource,
    RuntimeNextActionTarget,
} from "../runtime-next-action/runtimeNextActionTypes";

export type RuntimeActionHistoryStatus =
  | "active"
  | "navigated"
  | "completed"
  | "superseded"
  | "unresolved";

export type RuntimeActionTransitionType =
  | "initial"
  | "changed"
  | "repeated"
  | "completed-and-advanced"
  | "superseded";

export type RuntimeActionHistorySnapshot = {
  kind: RuntimeNextActionKind;

  title: string;
  description: string;

  target: RuntimeNextActionTarget;
  confidence: RuntimeNextActionConfidence;

  source: RuntimeNextActionSource;
  sourceLabel: string;

  whySummary: string | null;
  evidenceSummary: string | null;
  signalCount: number;
};

export type RuntimeActionNavigationEvent = {
  id: string;
  target: RuntimeNextActionTarget;
  occurredAt: string;
};

export type RuntimeActionCompletionEvidence = {
  type:
    | "github-snapshot-created"
    | "github-snapshot-updated"
    | "reflection-recorded"
    | "current-focus-updated"
    | "runtime-analysis-completed"
    | "connected-event-added"
    | "fallback-resolved";

  description: string;
  occurredAt: string;
};

export type RuntimeActionHistoryEntry = {
  id: string;

  projectId: string;
  fingerprint: string;

  action: RuntimeActionHistorySnapshot;

  status: RuntimeActionHistoryStatus;

  firstObservedAt: string;
  lastObservedAt: string;

  observationCount: number;
  consecutiveRepeatCount: number;

  navigationEvents:
    RuntimeActionNavigationEvent[];

  completionEvidence:
    RuntimeActionCompletionEvidence[];

  completedAt: string | null;
  supersededAt: string | null;

  replacedByEntryId: string | null;
};

export type RuntimeActionTransition = {
  id: string;

  projectId: string;

  fromEntryId: string | null;
  toEntryId: string;

  type: RuntimeActionTransitionType;

  occurredAt: string;
};

export type RuntimeActionHistoryState = {
  version: 1;

  entries:
    RuntimeActionHistoryEntry[];

  transitions:
    RuntimeActionTransition[];

  activeEntryId: string | null;
};