import { useState } from "react";

import {
  submitReflectionToRuntime,
} from "../runtime-adapter/publicRuntimeAdapter";

import type {
  RuntimeReflectionResult,
} from "../runtime-adapter/runtimeAdapterTypes";

export function ReflectionRuntimePanel() {
  const [content, setContent] = useState("");
  const [result, setResult] =
    useState<RuntimeReflectionResult | null>(null);
  const [error, setError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const session = result?.session;

  const handleSubmit = async () => {
    setError(null);
    setResult(null);

    if (content.trim().length === 0) {
      setError("Reflection content is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await submitReflectionToRuntime(content);

      if (!response.ok) {
        setError(
          response.errors
            .map((item) => item.message)
            .join(" ")
        );
        return;
      }

      setResult(response.result);
    } catch {
      setError(
        "Unable to reach the private runtime server."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="runtime-panel">
      <p className="eyebrow">Runtime Adapter</p>

      <h2>Try a private runtime reflection</h2>

      <p className="runtime-description">
        This public landing page sends your reflection to the
        private InnerMirror runtime API and displays a structured
        runtime response.
      </p>

      <textarea
        className="reflection-input"
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        placeholder="Write a short reflection about your current project decision..."
      />

      <button
        className="runtime-button"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Analyzing..."
          : "Send to Runtime"}
      </button>

      {error !== null && (
        <div className="runtime-error">
          {error}
        </div>
      )}

      {result !== null && (
        <div className="runtime-result">
          <div className="result-card">
            <span>Summary</span>
            <strong>{result.summary.text}</strong>
            <p>{result.summary.description}</p>
          </div>

          <div className="result-card">
            <span>Continuity</span>
            <strong>
              {result.continuitySignal.label}
            </strong>
            <p>
              {result.continuitySignal.description}
            </p>
          </div>

          <div className="result-card">
            <span>Pacing</span>
            <strong>{result.pacingHint.label}</strong>
            <p>{result.pacingHint.description}</p>
          </div>

          <div className="result-card">
            <span>Next Question</span>
            <strong>
              {result.nextQuestion.question}
            </strong>
            <p>{result.nextQuestion.reason}</p>
          </div>

          {session !== undefined && (
            <div className="result-card">
              <span>Session</span>
              <strong>
                {session.reflectionCount} reflections · Score{" "}
                {session.continuityScore}
              </strong>
              <p>
                Evolution: {session.continuityEvolution}
              </p>
              <p>
                Session ID: {session.sessionId}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}