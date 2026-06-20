import { useState } from "react";
import { RuntimeErrorState } from "../components/RuntimeErrorState";
import { RuntimeLoadingState } from "../components/RuntimeLoadingState";
import { RuntimeReflectionResultView } from "../components/RuntimeReflectionResult";
import { useRuntimeReflection } from "../runtime-adapter/useRuntimeReflection";

export function App() {
  const [content, setContent] =
    useState("");

  const {
    isLoading,
    result,
    error,
    submitReflection,
  } = useRuntimeReflection();

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
        <RuntimeReflectionResultView
          result={result}
        />
      ) : null}
    </main>
  );
}

export default App;