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
      title: "생각을 기록했습니다.",
      message:
        "화면을 멈추지 않고, 지금 흐름을 바로 정리하고 있습니다.",
    };
  }

  if (status === "analyzing") {
    return {
      visible: true,
      status,
      title: "이 흐름을 분석하고 있습니다.",
      message:
        "summary, pacing, next question을 준비하고 있습니다.",
    };
  }

  if (status === "connecting") {
    return {
      visible: true,
      status,
      title: "이전 reflection과 연결 중입니다.",
      message:
        "비슷한 흐름과 반복되는 주제를 함께 확인하고 있습니다.",
    };
  }

  if (status === "failed") {
    return {
      visible: true,
      status,
      title: "기록은 유지되었습니다.",
      message:
        "깊은 runtime 분석은 실패했지만, 입력한 생각은 화면에 남아 있습니다.",
    };
  }

  return {
    visible: false,
    status,
    title: "",
    message: "",
  };
}