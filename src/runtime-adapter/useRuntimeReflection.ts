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

import {
  createOptimisticReflectionResult,
} from "../runtime/createOptimisticReflectionResult";

import type {
  ImmediateReflectionFeedbackData,
  ImmediateReflectionStatus,
} from "../types/runtimeOptimisticResponse";

export type RuntimeReflectionState = {
  isLoading: boolean;
  result: RuntimeReflectionResult | null;
  error: RuntimeAdapterError | null;
  isOptimistic: boolean;
  immediateFeedback: ImmediateReflectionFeedbackData;
};

const initialImmediateFeedback:
  ImmediateReflectionFeedbackData = {
  visible: false,
  status: "idle",
  title: "",
  message: "",
};

export function useRuntimeReflection() {
  const [state, setState] =
    useState<RuntimeReflectionState>({
      isLoading: false,
      result: null,
      error: null,
      isOptimistic: false,
      immediateFeedback:
        initialImmediateFeedback,
    });

  const submitReflection = useCallback(
    async (content: string) => {
      const optimisticResult =
        createOptimisticReflectionResult(
          content
        );

      setState({
        isLoading: true,
        result: optimisticResult,
        error: null,
        isOptimistic: true,
        immediateFeedback:
          createImmediateFeedback(
            "recorded"
          ),
      });

      window.setTimeout(() => {
        setState((current) => {
          if (!current.isLoading) {
            return current;
          }

          return {
            ...current,
            immediateFeedback:
              createImmediateFeedback(
                "analyzing"
              ),
          };
        });
      }, 800);

      window.setTimeout(() => {
        setState((current) => {
          if (!current.isLoading) {
            return current;
          }

          return {
            ...current,
            immediateFeedback:
              createImmediateFeedback(
                "connecting"
              ),
          };
        });
      }, 2200);

      try {
        const result =
          await submitReflectionToRuntime(
            content
          );

        setState({
          isLoading: false,
          result,
          error: null,
          isOptimistic: false,
          immediateFeedback:
            createImmediateFeedback(
              "completed"
            ),
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

        setState((current) => ({
          isLoading: false,
          result:
            current.result,
          error: runtimeError,
          isOptimistic:
            current.isOptimistic,
          immediateFeedback:
            createImmediateFeedback(
              "failed"
            ),
        }));

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
      isOptimistic: false,
      immediateFeedback:
        initialImmediateFeedback,
    });
  }, []);

  return {
    ...state,
    submitReflection,
    reset,
  };
}

function createImmediateFeedback(
  status: ImmediateReflectionStatus
): ImmediateReflectionFeedbackData {
  if (status === "recorded") {
    return {
      visible: true,
      status,
      title:
        "Reflection recorded.",
      message:
        "Runtime is organizing the current flow without interrupting the screen.",
    };
  }

  if (status === "analyzing") {
    return {
      visible: true,
      status,
      title:
        "Analyzing the current flow.",
      message:
        "Runtime is preparing the summary, pacing, and next question.",
    };
  }

  if (status === "connecting") {
    return {
      visible: true,
      status,
      title:
        "Connecting with earlier Reflections.",
      message:
        "Runtime is reviewing similar flows and recurring themes.",
    };
  }

  if (status === "failed") {
    return {
      visible: true,
      status,
      title:
        "The Reflection remains saved.",
      message:
        "Deep Runtime analysis failed, but the recorded thought remains available.",
    };
  }

  return {
    visible: false,
    status,
    title: "",
    message: "",
  };
}