import {
    submitReflectionToRuntime,
} from "../runtime-adapter/publicRuntimeAdapter";

import type {
    LocalReflectionRecord,
} from "./localReflectionTypes";

export async function syncLocalReflectionToRuntime(
  record: LocalReflectionRecord
): Promise<{
  runtimeReflectionId: string;
}> {
  const result =
    await submitReflectionToRuntime(
      record.content
    );

  return {
    runtimeReflectionId:
      result.reflectionId,
  };
}