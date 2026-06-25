import type {
    RuntimeFailureRecoveryState,
} from "../../runtime-adapter/runtimeFailureRecoveryTypes";

type Props = {
  recovery: RuntimeFailureRecoveryState;
  onRetryRuntime: () => void;
  onRetryTimeline: () => void;
  onSyncLocal: () => void;
};

export function RuntimeFailureRecoveryNotice({
  recovery,
  onRetryRuntime,
  onRetryTimeline,
  onSyncLocal,
}: Props) {
  if (!recovery.visible) {
    return null;
  }

  return (
    <section
      className={[
        "runtime-failure-recovery-notice",
        `runtime-failure-recovery-notice-${recovery.severity}`,
      ].join(" ")}
    >
      <div>
        <div className="runtime-failure-recovery-eyebrow">
          Recovery
        </div>

        <strong>
          {recovery.title}
        </strong>

        <p>
          {recovery.message}
        </p>

        <p className="runtime-failure-recovery-reassurance">
          {recovery.reassurance}
        </p>
      </div>

      {recovery.action !== "none" ? (
        <button
          type="button"
          onClick={() => {
            if (recovery.action === "retry-runtime") {
              onRetryRuntime();
            }

            if (recovery.action === "retry-timeline") {
              onRetryTimeline();
            }

            if (recovery.action === "sync-local") {
              onSyncLocal();
            }
          }}
        >
          {createActionLabel(
            recovery.action
          )}
        </button>
      ) : null}
    </section>
  );
}

function createActionLabel(
  action: RuntimeFailureRecoveryState["action"]
): string {
  if (action === "retry-runtime") {
    return "Runtime 다시 확인";
  }

  if (action === "retry-timeline") {
    return "Timeline 다시 불러오기";
  }

  if (action === "sync-local") {
    return "로컬 기록 연결";
  }

  return "";
}