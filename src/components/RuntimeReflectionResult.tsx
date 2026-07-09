import type { RuntimeReflectionResult } from "../runtime-adapter/runtimeAdapterTypes";

type RuntimeReflectionResultProps = {
  result: RuntimeReflectionResult;
};

export function RuntimeReflectionResultView({
  result,
}: RuntimeReflectionResultProps) {
  return (
    <section className="runtime-reflection-result">
      <div className="runtime-result-block">
        <span className="runtime-result-label">
          Next Question
        </span>

        <p>{result.nextQuestion.question}</p>

        <small>{result.nextQuestion.reason}</small>
      </div>

      <details className="reflection-feedback-advanced">
        <summary>View reflection details</summary>

        <div className="runtime-result-block">
          <span className="runtime-result-label">
            Summary
          </span>

          <p>{result.summary.text}</p>

          <small>
            Confidence: {result.summary.confidence}
          </small>
        </div>

        <div className="runtime-result-block">
          <span className="runtime-result-label">
            Pacing
          </span>

          <p>{result.pacing.message}</p>

          <small>
            Level: {result.pacing.level}
          </small>
        </div>

        <div className="runtime-result-block">
          <span className="runtime-result-label">
            Continuity
          </span>

          <p>{result.continuitySignal.message}</p>

          <small>
            Status: {result.continuitySignal.status} · Strength:{" "}
            {result.continuitySignal.strength}
          </small>
        </div>
      </details>
    </section>
  );
}