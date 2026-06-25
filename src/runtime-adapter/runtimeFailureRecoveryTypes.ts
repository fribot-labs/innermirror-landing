export type RuntimeFailureRecoveryKind =
  | "none"
  | "fast-path-timeout"
  | "memory-timeline-unavailable"
  | "deep-merge-delayed"
  | "runtime-offline"
  | "runtime-degraded"
  | "runtime-unknown-error";

export type RuntimeFailureRecoverySeverity =
  | "info"
  | "warning"
  | "danger";

export type RuntimeFailureRecoveryAction =
  | "none"
  | "retry-runtime"
  | "retry-timeline"
  | "sync-local";

export type RuntimeFailureRecoveryState = {
  visible: boolean;
  kind: RuntimeFailureRecoveryKind;
  severity: RuntimeFailureRecoverySeverity;
  title: string;
  message: string;
  reassurance: string;
  action: RuntimeFailureRecoveryAction;
};