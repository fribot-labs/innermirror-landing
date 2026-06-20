import {
    useCallback,
    useState,
} from "react";

import {
    submitReflectionToRuntime,
} from "./publicRuntimeAdapter";

import type {
    RuntimeReflectionResult,
} from "./runtimeAdapterTypes";

import {
    RuntimeAdapterError,
} from "./runtimeAdapterErrors";

export type RuntimeReflectionState = {
  isLoading: boolean;
  result: RuntimeReflectionResult | null;
  error: RuntimeAdapterError | null;
};

export function useRuntimeReflection() {
  const [state, setState] =
    useState<RuntimeReflectionState>({
      isLoading: false,
      result: null,
      error: null,
    });

  const submitReflection = useCallback(
    async (content: string) => {
      setState({
        isLoading: true,
        result: null,
        error: null,
      });

      try {
        const result =
          await submitReflectionToRuntime(
            content
          );

        setState({
          isLoading: false,
          result,
          error: null,
        });

        return result;
      } catch (error) {
        const runtimeError =
          error instanceof RuntimeAdapterError
            ? error
            : new RuntimeAdapterError(
                "RUNTIME_UNKNOWN_ERROR",
                "Unknown runtime error.",
                true
              );

        setState({
          isLoading: false,
          result: null,
          error: runtimeError,
        });

        throw runtimeError;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      result: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    submitReflection,
    reset,
  };
}