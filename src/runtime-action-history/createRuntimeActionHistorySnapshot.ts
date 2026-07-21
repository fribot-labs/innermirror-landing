import type {
    RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

import type {
    RuntimeActionHistorySnapshot,
} from "./runtimeActionHistoryTypes";

export function createRuntimeActionHistorySnapshot(
  action: RuntimeNextAction
): RuntimeActionHistorySnapshot {
  return {
    kind:
      action.kind,

    title:
      action.title,

    description:
      action.description,

    target:
      action.target,

    confidence:
      action.confidence,

    source:
      action.source,

    sourceLabel:
      action.sourceLabel,

    whySummary:
      action.why?.summary ??
      action.reason ??
      null,

    evidenceSummary:
      action.evidence?.summary ??
      null,

    signalCount:
      action.evidence === undefined
        ? 1
        : 1 +
          action.evidence
            .supporting.length,
  };
}