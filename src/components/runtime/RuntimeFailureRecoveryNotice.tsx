import type {
  RuntimeFailureRecoveryState,
} from "../../runtime-adapter/runtimeFailureRecoveryTypes";

type Props = {
  recovery: RuntimeFailureRecoveryState;
  visible: boolean;
  isRecoveryComplete: boolean;
  displayTitle: string;
  displayMessage: string;
  onRetryRuntime: () => void;
  onRetryTimeline: () => void;
  onSyncLocal: () => void;
  onDismiss: () => void;
};

export function RuntimeFailureRecoveryNotice({
  recovery,
  visible,
  isRecoveryComplete,
  displayTitle,
  displayMessage,
  onRetryRuntime,
  onRetryTimeline,
  onSyncLocal,
  onDismiss,
}: Props) {
  if (!visible) {
    return null;
  }

  return (
    <section
      className={[
        "runtime-failure-recovery-notice",
        `runtime-failure-recovery-notice-${recovery.severity}`,
        isRecoveryComplete
          ? "runtime-failure-recovery-notice-complete"
          : "",
      ].join(" ")}
    >
      <div>
        <div className="runtime-failure-recovery-eyebrow">
          {isRecoveryComplete
            ? "Recovery Complete"
            : "Recovery"}
        </div>

        <strong>
          {displayTitle}
        </strong>

        <p>
          {recovery.message}
        </p>

        <p className="runtime-failure-recovery-reassurance">
          {displayMessage}
        </p>
      </div>

      <div className="runtime-failure-recovery-actions">
        {!isRecoveryComplete &&
        recovery.action !== "none" ? (
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

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss recovery notice"
        >
          닫기
        </button>
      </div>
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