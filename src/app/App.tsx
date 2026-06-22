import { useState } from "react";
import { RuntimeErrorState } from "../components/RuntimeErrorState";
import { RuntimeLoadingState } from "../components/RuntimeLoadingState";
import { RuntimeReflectionResultView } from "../components/RuntimeReflectionResult";
import { ReflectionContinuitySurface } from "../components/runtime/ReflectionContinuitySurface";
import { ReturningThemeSurface } from "../components/runtime/ReturningThemeSurface";
import { useRuntimeReflection } from "../runtime-adapter/useRuntimeReflection";
import { createReflectionContinuitySurfaceData } from "../runtime/createReflectionContinuitySurfaceData";
import { createReturningThemeSurfaceData } from "../runtime/createReturningThemeSurfaceData";

export function App() {
  const [content, setContent] =
    useState("");

  const {
    isLoading,
    result,
    error,
    submitReflection,
  } = useRuntimeReflection();

  const continuitySurfaceData =
    createReflectionContinuitySurfaceData(
      result
    );

  const returningThemeSurfaceData =
    createReturningThemeSurfaceData(
      result
    );

  const handleSubmit =
    async () => {
      if (content.trim().length === 0) {
        return;
      }

      await submitReflection(content);
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
          <RuntimeReflectionResultView
            result={result}
          />

          <ReflectionContinuitySurface
            data={continuitySurfaceData}
          />

          <ReturningThemeSurface
            data={returningThemeSurfaceData}
          />
        </>
      ) : null}
    </main>
  );
}

export default App;