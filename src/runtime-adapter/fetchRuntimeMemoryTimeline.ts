import {
    RuntimeAdapterError,
} from "./runtimeAdapterErrors";

import type {
    RuntimeMemoryTimelineResponse,
} from "../types/runtimeStreamingMerge";

const RUNTIME_BASE_URL =
  getRuntimeBaseUrl();

export async function fetchRuntimeMemoryTimeline(
  params: {
    userId?: string;
    limit?: number;
  } = {}
): Promise<RuntimeMemoryTimelineResponse["result"]> {
  const url =
    new URL(
      `${RUNTIME_BASE_URL}/runtime/memory/timeline`
    );

  if (params.userId) {
    url.searchParams.set(
      "userId",
      params.userId
    );
  }

  url.searchParams.set(
    "limit",
    String(params.limit ?? 5)
  );

  const response =
    await fetch(url.toString());

  if (!response.ok) {
    throw new RuntimeAdapterError(
      "RUNTIME_SERVER_ERROR",
      `Runtime memory timeline request failed with status ${response.status}`,
      response.status >= 500
    );
  }

  const data =
    (await response.json()) as RuntimeMemoryTimelineResponse;

  if (!data.ok || !data.result) {
    throw new RuntimeAdapterError(
      "RUNTIME_INVALID_RESPONSE",
      data.error?.message ??
        "Runtime memory timeline response is invalid.",
      true
    );
  }

  return data.result;
}

function getRuntimeBaseUrl(): string {
  const value =
    import.meta.env.VITE_RUNTIME_API_URL;

  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return value;
  }

  return "http://localhost:4000";
}