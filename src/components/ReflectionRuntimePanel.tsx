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

  const handleSubmit = async () => {
    setError(null);
    setResult(null);

    if (content.trim().length === 0) {
      setError("Reflection content is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const runtimeResult =
        await submitReflectionToRuntime(content);

      setResult(runtimeResult);
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

      {error !== null ? (
        <div className="runtime-error">
          {error}
        </div>
      ) : null}

      {result !== null ? (
        <div className="runtime-result">
          <div className="result-card">
            <span>Next Question</span>

            <strong>
              {result.nextQuestion.question}
            </strong>

            <p>{result.nextQuestion.reason}</p>
          </div>

          <details className="reflection-feedback-advanced">
            <summary>View reflection details</summary>

            <div className="result-card">
              <span>Summary</span>

              <strong>{result.summary.text}</strong>

              <p>
                Confidence: {result.summary.confidence}
              </p>
            </div>

            <div className="result-card">
              <span>Pacing</span>

              <strong>{result.pacing.level}</strong>

              <p>{result.pacing.message}</p>
            </div>

            <div className="result-card">
              <span>Continuity</span>

              <strong>
                {result.continuitySignal.status}
              </strong>

              <p>{result.continuitySignal.message}</p>

              <p>
                Strength: {result.continuitySignal.strength}
              </p>

              {result.continuitySignal.relatedSummary ? (
                <p>
                  Related:{" "}
                  {result.continuitySignal.relatedSummary}
                </p>
              ) : null}

              {result.continuitySignal.relatedTimeLabel ? (
                <p>
                  Time:{" "}
                  {result.continuitySignal.relatedTimeLabel}
                </p>
              ) : null}

              {result.continuitySignal.driftStrength ? (
                <p>
                  Drift:{" "}
                  {result.continuitySignal.driftStrength}
                  {result.continuitySignal.driftDirection
                    ? ` · ${result.continuitySignal.driftDirection}`
                    : ""}
                </p>
              ) : null}
            </div>
          </details>
        </div>
      ) : null}
    </section>
  );
}