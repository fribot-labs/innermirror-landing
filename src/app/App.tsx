import { useState } from "react";
import { RuntimeErrorState } from "../components/RuntimeErrorState";
import { RuntimeLoadingState } from "../components/RuntimeLoadingState";
import { RuntimeReflectionResultView } from "../components/RuntimeReflectionResult";
import { IdentityDriftSurface } from "../components/runtime/IdentityDriftSurface";
import { ImmediateReflectionFeedback } from "../components/runtime/ImmediateReflectionFeedback";
import { LocalReflectionList } from "../components/runtime/LocalReflectionList";
import { LocalReflectionPersistenceNotice } from "../components/runtime/LocalReflectionPersistenceNotice";
import { LongGapRecoverySurface } from "../components/runtime/LongGapRecoverySurface";
import { ReflectionContinuitySurface } from "../components/runtime/ReflectionContinuitySurface";
import { ReturningThemeSurface } from "../components/runtime/ReturningThemeSurface";
import { RuntimeBoundaryStatusBanner } from "../components/runtime/RuntimeBoundaryStatusBanner";
import { RuntimeFallbackModeNotice } from "../components/runtime/RuntimeFallbackModeNotice";
import { RuntimeMemoryTimeline } from "../components/runtime/RuntimeMemoryTimeline";
import { RuntimeStreamingMergeSurface } from "../components/runtime/RuntimeStreamingMergeSurface";
import { resolveRuntimeUxMode } from "../runtime-adapter/resolveRuntimeUxMode";
import { useRuntimeBoundaryHealth } from "../runtime-adapter/useRuntimeBoundaryHealth";
import { useRuntimeReflection } from "../runtime-adapter/useRuntimeReflection";
import { useRuntimeStreamingMerge } from "../runtime-adapter/useRuntimeStreamingMerge";
import { useLocalReflectionPersistence } from "../runtime-local/useLocalReflectionPersistence";
import { createIdentityDriftSurfaceData } from "../runtime/createIdentityDriftSurfaceData";
import { createLongGapRecoverySurfaceData } from "../runtime/createLongGapRecoverySurfaceData";
import { createReflectionContinuitySurfaceData } from "../runtime/createReflectionContinuitySurfaceData";
import { createReturningThemeSurfaceData } from "../runtime/createReturningThemeSurfaceData";
import { useRuntimeMemoryTimeline } from "../runtime/useRuntimeMemoryTimeline";

export function App() {
  const [content, setContent] =
    useState("");

  const {
    isLoading,
    result,
    error,
    isOptimistic,
    immediateFeedback,
    submitReflection,
  } = useRuntimeReflection();

  const {
    isMerging,
    events: streamingMergeEvents,
    startMerge,
    resetMerge,
  } = useRuntimeStreamingMerge();

  const {
    isChecking: isCheckingBoundary,
    health: runtimeBoundaryHealth,
    checkHealth,
  } = useRuntimeBoundaryHealth();

  const runtimeUxMode =
    resolveRuntimeUxMode({
      health:
        runtimeBoundaryHealth,
      isChecking:
        isCheckingBoundary,
    });

  const isLocalOnlyMode =
    runtimeUxMode.mode === "local-only";

  const {
    snapshot: localReflectionSnapshot,
    saveLocalReflection,
    clearLocalReflectionMemory,
  } = useLocalReflectionPersistence();

  const continuitySurfaceData =
    createReflectionContinuitySurfaceData(
      result
    );

  const returningThemeSurfaceData =
    createReturningThemeSurfaceData(
      result
    );

  const longGapRecoverySurfaceData =
    createLongGapRecoverySurfaceData(
      result
    );

  const identityDriftSurfaceData =
    createIdentityDriftSurfaceData(
      result
    );

  const runtimeMemoryTimelineData =
    useRuntimeMemoryTimeline(
      result
    );

  const handleSubmit =
    async () => {
      const trimmedContent =
        content.trim();

      if (trimmedContent.length === 0) {
        return;
      }

      resetMerge();

      if (isLocalOnlyMode) {
        saveLocalReflection(
          trimmedContent
        );

        setContent("");

        return;
      }

      await submitReflection(
        trimmedContent
      );

      if (
        runtimeUxMode.canUseStreamingMerge
      ) {
        void startMerge({
          content:
            trimmedContent,
        });
      }
    };

  return (
    <main>
      <RuntimeBoundaryStatusBanner
        health={runtimeBoundaryHealth}
        isChecking={isCheckingBoundary}
        onRefresh={checkHealth}
      />

      <RuntimeFallbackModeNotice
        uxMode={runtimeUxMode}
      />

      <LocalReflectionPersistenceNotice
        snapshot={localReflectionSnapshot}
        isLocalOnlyMode={isLocalOnlyMode}
      />

      <textarea
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        placeholder="Write a reflection..."
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Reading..." : "Reflect"}
      </button>

      <ImmediateReflectionFeedback
        data={immediateFeedback}
      />

      {runtimeUxMode.canUseStreamingMerge ? (
        <RuntimeStreamingMergeSurface
          events={streamingMergeEvents}
          isMerging={isMerging}
        />
      ) : null}

      {isLoading ? (
        <RuntimeLoadingState />
      ) : null}

      {error !== null ? (
        <RuntimeErrorState
          error={error}
          onRetry={handleSubmit}
        />
      ) : null}

      {result !== null ? (
        <>
          {isOptimistic ? (
            <div className="optimistic-result-note">
              임시 분석 결과입니다. 깊은 runtime 결과가 도착하면 자동으로 갱신됩니다.
            </div>
          ) : null}

          <RuntimeReflectionResultView
            result={result}
          />

          {runtimeUxMode.canUseContinuitySurfaces ? (
            <>
              <ReflectionContinuitySurface
                data={continuitySurfaceData}
              />

              <ReturningThemeSurface
                data={returningThemeSurfaceData}
              />

              <LongGapRecoverySurface
                data={longGapRecoverySurfaceData}
              />

              <IdentityDriftSurface
                data={identityDriftSurfaceData}
              />
            </>
          ) : null}

          {runtimeUxMode.canUseMemoryTimeline ? (
            <RuntimeMemoryTimeline
              data={runtimeMemoryTimelineData}
            />
          ) : null}
        </>
      ) : null}

      {localReflectionSnapshot.totalCount > 0 ? (
        <LocalReflectionList
          snapshot={localReflectionSnapshot}
          onClear={clearLocalReflectionMemory}
        />
      ) : null}
    </main>
  );
}

export default App;