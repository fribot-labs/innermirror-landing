import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    fetchRuntimeMemoryTimeline,
} from "./fetchRuntimeMemoryTimeline";

import {
    RuntimeAdapterError,
} from "./runtimeAdapterErrors";

import type {
    RuntimeMemoryTimelineResponse,
} from "../types/runtimeStreamingMerge";

type ServerRuntimeMemoryTimelineResult =
  NonNullable<RuntimeMemoryTimelineResponse["result"]>;

export type ServerRuntimeMemoryTimelineState = {
  isLoading: boolean;
  timeline: ServerRuntimeMemoryTimelineResult | null;
  error: RuntimeAdapterError | null;
  lastLoadedAt: string | null;
};

export function useServerRuntimeMemoryTimeline(params: {
  enabled: boolean;
  userId?: string;
  limit?: number;
}) {
  const [state, setState] =
    useState<ServerRuntimeMemoryTimelineState>({
      isLoading: false,
      timeline: null,
      error: null,
      lastLoadedAt: null,
    });

  const refresh =
    useCallback(async () => {
      if (!params.enabled) {
        return null;
      }

      setState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));

      try {
        const timeline =
          await fetchRuntimeMemoryTimeline({
            userId:
              params.userId,
            limit:
              params.limit ?? 5,
          });

        if (!timeline) {
          throw new RuntimeAdapterError(
            "RUNTIME_INVALID_RESPONSE",
            "Runtime memory timeline result is missing.",
            true
          );
        }

        setState({
          isLoading: false,
          timeline,
          error: null,
          lastLoadedAt:
            new Date().toISOString(),
        });

        return timeline;
      } catch (error) {
        const runtimeError =
          error instanceof RuntimeAdapterError
            ? error
            : new RuntimeAdapterError(
                "RUNTIME_UNKNOWN_ERROR",
                "Runtime memory timeline load failed.",
                true
              );

        setState((current) => ({
          ...current,
          isLoading: false,
          error:
            runtimeError,
        }));

        return null;
      }
    }, [
      params.enabled,
      params.userId,
      params.limit,
    ]);

  useEffect(() => {
    if (params.enabled) {
      void refresh();
    }
  }, [
    params.enabled,
    refresh,
  ]);

  return {
    ...state,
    refresh,
  };
}