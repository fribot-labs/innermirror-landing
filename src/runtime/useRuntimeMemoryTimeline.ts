import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createRuntimeMemoryTimelineItem,
} from "./createRuntimeMemoryTimelineItem";

import type {
  RuntimeReflectionResult,
} from "../runtime-adapter/runtimeAdapterTypes";

import type {
  RuntimeMemoryTimelineData,
  RuntimeMemoryTimelineItem,
} from "../types/runtimeMemoryTimeline";

const STORAGE_KEY =
  "innermirror.runtimeMemoryTimeline.v1";

const MAX_TIMELINE_ITEMS = 5;

export function useRuntimeMemoryTimeline(
  result: RuntimeReflectionResult | null
): RuntimeMemoryTimelineData {
  const [items, setItems] =
    useState<RuntimeMemoryTimelineItem[]>(
      () => loadTimelineItems()
    );

  useEffect(() => {
    if (result === null) {
      return;
    }

    const nextItem =
      createRuntimeMemoryTimelineItem(
        result
      );

    setItems((currentItems) => {
      if (
        currentItems.some(
          (item) =>
            item.id === nextItem.id ||
            item.summary === nextItem.summary
        )
      ) {
        return currentItems;
      }

      const nextItems =
        [
          nextItem,
          ...currentItems,
        ].slice(0, MAX_TIMELINE_ITEMS);

      saveTimelineItems(nextItems);

      return nextItems;
    });
  }, [result]);

  return useMemo(
    () => ({
      visible:
        items.length > 0,
      title:
        "기억 흐름",
      subtitle:
        "최근 reflection이 시간 흐름으로 쌓이고 있습니다.",
      items,
    }),
    [items]
  );
}

function loadTimelineItems():
  RuntimeMemoryTimelineItem[] {
  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (raw === null) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      isRuntimeMemoryTimelineItem
    );
  } catch {
    return [];
  }
}

function saveTimelineItems(
  items: RuntimeMemoryTimelineItem[]
): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );
  } catch {
    // localStorage may be unavailable.
  }
}

function isRuntimeMemoryTimelineItem(
  value: unknown
): value is RuntimeMemoryTimelineItem {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const item =
    value as Partial<RuntimeMemoryTimelineItem>;

  return (
    typeof item.id === "string" &&
    typeof item.summary === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.timeLabel === "string"
  );
}