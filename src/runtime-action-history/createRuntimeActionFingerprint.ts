import type {
    RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

type CreateRuntimeActionFingerprintParams = {
  projectId: string;
  action: RuntimeNextAction;
};

export function createRuntimeActionFingerprint({
  projectId,
  action,
}: CreateRuntimeActionFingerprintParams): string {
  return [
    projectId,
    action.kind,
    action.target ?? "no-target",
    action.source,
    normalizeFingerprintText(
      action.title
    ),
  ].join("::");
}

function normalizeFingerprintText(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /[^a-z0-9-_]/g,
      ""
    )
    .slice(
      0,
      120
    );
}