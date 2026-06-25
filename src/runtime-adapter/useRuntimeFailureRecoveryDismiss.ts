import {
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    RuntimeFailureRecoveryState,
} from "./runtimeFailureRecoveryTypes";

type RuntimeRecoveryDismissState = {
  visible: boolean;
  isRecoveryComplete: boolean;
  title: string;
  message: string;
  dismiss: () => void;
};

const AUTO_DISMISS_MS =
  2500;

export function useRuntimeFailureRecoveryDismiss(params: {
  recovery: RuntimeFailureRecoveryState;
  isRuntimeHealthy: boolean;
}): RuntimeRecoveryDismissState {
  const [dismissedKey, setDismissedKey] =
    useState<string | null>(null);

  const recoveryKey =
    createRecoveryKey(
      params.recovery
    );

  const isRecoveryComplete =
    params.recovery.visible &&
    params.isRuntimeHealthy &&
    params.recovery.kind !== "none";

  useEffect(() => {
    if (
      params.recovery.visible &&
      !isRecoveryComplete
    ) {
      setDismissedKey(null);
    }
  }, [
    params.recovery.visible,
    isRecoveryComplete,
    recoveryKey,
  ]);

  useEffect(() => {
    if (!isRecoveryComplete) {
      return;
    }

    const timerId =
      window.setTimeout(() => {
        setDismissedKey(
          recoveryKey
        );
      }, AUTO_DISMISS_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    isRecoveryComplete,
    recoveryKey,
  ]);

  const visible =
    params.recovery.visible &&
    dismissedKey !== recoveryKey;

  const dismiss =
    () => {
      setDismissedKey(
        recoveryKey
      );
    };

  return useMemo(
    () => ({
      visible,
      isRecoveryComplete,
      title:
        isRecoveryComplete
          ? "Runtime 연결이 복구되었습니다."
          : params.recovery.title,
      message:
        isRecoveryComplete
          ? "기록은 유지되었고, 깊은 분석을 다시 연결할 수 있습니다."
          : params.recovery.reassurance,
      dismiss,
    }),
    [
      visible,
      isRecoveryComplete,
      params.recovery.title,
      params.recovery.reassurance,
      recoveryKey,
    ]
  );
}

function createRecoveryKey(
  recovery: RuntimeFailureRecoveryState
): string {
  return [
    recovery.kind,
    recovery.title,
    recovery.message,
  ].join(":");
}