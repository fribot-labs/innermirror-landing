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
          Summary
        </span>
        <p>{result.summary.text}</p>
      </div>

      <div className="runtime-result-block">
        <span className="runtime-result-label">
          Pacing
        </span>
        <p>{result.pacing.message}</p>
      </div>

      <div className="runtime-result-block">
        <span className="runtime-result-label">
          Next Question
        </span>
        <p>{result.nextQuestion.question}</p>
      </div>

      <div className="runtime-result-block">
        <span className="runtime-result-label">
          Continuity
        </span>
        <p>{result.continuitySignal.message}</p>
      </div>
    </section>
  );
}