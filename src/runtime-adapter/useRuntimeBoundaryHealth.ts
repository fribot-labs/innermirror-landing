import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    fetchRuntimeBoundaryHealth,
} from "./fetchRuntimeBoundaryHealth";

import {
    RuntimeAdapterError,
} from "./runtimeAdapterErrors";

import type {
    RuntimeBoundaryHealthResult,
} from "./runtimeBoundaryTypes";

export type RuntimeBoundaryHealthState = {
  isChecking: boolean;
  health: RuntimeBoundaryHealthResult | null;
  error: RuntimeAdapterError | null;
  lastCheckedAt: string | null;
};

export function useRuntimeBoundaryHealth() {
  const [state, setState] =
    useState<RuntimeBoundaryHealthState>({
      isChecking: true,
      health: null,
      error: null,
      lastCheckedAt: null,
    });

  const checkHealth =
    useCallback(async () => {
      setState((current) => ({
        ...current,
        isChecking: true,
        error: null,
      }));

      try {
        const health =
          await fetchRuntimeBoundaryHealth();

        setState({
          isChecking: false,
          health,
          error: null,
          lastCheckedAt:
            new Date().toISOString(),
        });

        return health;
      } catch (error) {
        const runtimeError =
          error instanceof RuntimeAdapterError
            ? error
            : new RuntimeAdapterError(
                "RUNTIME_UNKNOWN_ERROR",
                "Runtime boundary health check failed.",
                true
              );

        setState({
          isChecking: false,
          health: {
            status: "unavailable",
            checks: [
              {
                name: "runtime-boundary",
                status: "fail",
                message:
                  runtimeError.message,
              },
            ],
            generatedAt:
              new Date().toISOString(),
          },
          error: runtimeError,
          lastCheckedAt:
            new Date().toISOString(),
        });

        return null;
      }
    }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  return {
    ...state,
    checkHealth,
  };
}