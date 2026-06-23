import { useState } from "react";
import { RuntimeErrorState } from "../components/RuntimeErrorState";
import { RuntimeLoadingState } from "../components/RuntimeLoadingState";
import { RuntimeReflectionResultView } from "../components/RuntimeReflectionResult";
import { IdentityDriftSurface } from "../components/runtime/IdentityDriftSurface";
import { ImmediateReflectionFeedback } from "../components/runtime/ImmediateReflectionFeedback";
import { LongGapRecoverySurface } from "../components/runtime/LongGapRecoverySurface";
import { ReflectionContinuitySurface } from "../components/runtime/ReflectionContinuitySurface";
import { ReturningThemeSurface } from "../components/runtime/ReturningThemeSurface";
import { RuntimeMemoryTimeline } from "../components/runtime/RuntimeMemoryTimeline";
import { RuntimeStreamingMergeSurface } from "../components/runtime/RuntimeStreamingMergeSurface";
import { useRuntimeReflection } from "../runtime-adapter/useRuntimeReflection";
import { useRuntimeStreamingMerge } from "../runtime-adapter/useRuntimeStreamingMerge";
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
      if (content.trim().length === 0) {
        return;
      }

      resetMerge();

      await submitReflection(content);

      void startMerge({
        content,
      });
    };

  return (
    <main>
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

      <RuntimeStreamingMergeSurface
        events={streamingMergeEvents}
        isMerging={isMerging}
      />

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

          <RuntimeMemoryTimeline
            data={runtimeMemoryTimelineData}
          />
        </>
      ) : null}
    </main>
  );
}

export default App;