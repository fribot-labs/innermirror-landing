import {
  useCallback,
  useState,
} from "react";

import {
  createRuntimeStreamingMergeEvent,
} from "./createRuntimeStreamingMergeEvent";

import {
  fetchRuntimeMemoryTimeline,
} from "./fetchRuntimeMemoryTimeline";

import type {
  RuntimeMemoryTimelineRecord,
  RuntimeStreamingMergeEvent,
} from "../types/runtimeStreamingMerge";

import {
  isRuntimeMemoryTimelineEnabled,
} from "./runtimeProductionCapabilities";


export type RuntimeStreamingMergeState = {
  isMerging: boolean;
  events: RuntimeStreamingMergeEvent[];
  latestTimelineItem:
    RuntimeMemoryTimelineRecord | null;
};

export function useRuntimeStreamingMerge() {
  const [state, setState] =
    useState<RuntimeStreamingMergeState>({
      isMerging: false,
      events: [],
      latestTimelineItem: null,
    });

  const startMerge = useCallback(
    async (params: {
      content: string;
      userId?: string;
    }) => {
      setState({
        isMerging: true,
        events: [
          createRuntimeStreamingMergeEvent(
            "recorded"
          ),
          createRuntimeStreamingMergeEvent(
            "fast-result"
          ),
        ],
        latestTimelineItem: null,
      });

      if (
        !isRuntimeMemoryTimelineEnabled()
      ) {
        setState((current) => ({
          ...current,
          isMerging: false,
          events: [
            ...current.events,
            createRuntimeStreamingMergeEvent(
              "completed"
            ),
          ],
        }));

        return;
      }

      window.setTimeout(() => {
        setState((current) => ({
          ...current,
          events: [
            ...current.events,
            createRuntimeStreamingMergeEvent(
              "memory-query"
            ),
          ],
        }));
      }, 900);

      window.setTimeout(async () => {
        try {
          const timeline =
            await fetchRuntimeMemoryTimeline({
              userId:
                params.userId,
              limit: 5,
            });

          const timelineItems =
            timeline?.items ?? [];

          const latest =
            findBestTimelineMatch(
              timelineItems,
              params.content
            );

          if (!latest) {
            setState((current) => ({
              ...current,
              isMerging: false,
              events: [
                ...current.events,
                createRuntimeStreamingMergeEvent(
                  "completed"
                ),
              ],
            }));

            return;
          }

          setState((current) => ({
            isMerging: false,
            latestTimelineItem:
              latest,
            events: [
              ...current.events,
              createRuntimeStreamingMergeEvent(
                "continuity-merged",
                latest
              ),
              createRuntimeStreamingMergeEvent(
                "completed"
              ),
            ],
          }));
        } catch {
          setState((current) => ({
            ...current,
            isMerging: false,
            events: [
              ...current.events,
              createRuntimeStreamingMergeEvent(
                "failed"
              ),
            ],
          }));
        }
      }, 2500);
    },
    []
  );

  const resetMerge = useCallback(() => {
    setState({
      isMerging: false,
      events: [],
      latestTimelineItem: null,
    });
  }, []);

  return {
    ...state,
    startMerge,
    resetMerge,
  };
}

function findBestTimelineMatch(
  items: RuntimeMemoryTimelineRecord[],
  content: string
): RuntimeMemoryTimelineRecord | null {
  const normalizedContent =
    normalizeText(content);

  return (
    items.find(
      (item) =>
        normalizeText(item.content) ===
        normalizedContent
    ) ??
    items.find(
      (item) =>
        normalizeText(
          item.summaryText
        ) === normalizedContent
    ) ??
    items[0] ??
    null
  );
}

function normalizeText(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}