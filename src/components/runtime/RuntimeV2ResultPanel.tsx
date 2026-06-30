import type { RuntimeContractV2Response } from "../../types/runtimeContractV2";

type RuntimeV2ResultPanelProps = {
  response: RuntimeContractV2Response;
};

export function RuntimeV2ResultPanel({
  response,
}: RuntimeV2ResultPanelProps) {
  const { meta, data } = response;

  return (
    <section className="runtime-v2-result-panel">
      <div className="runtime-v2-result-panel-header">
        <span className="runtime-v2-result-panel-eyebrow">
          Runtime V2 Result
        </span>

        <h2>Project-aware Runtime analysis</h2>

        <p>
          Runtime analyzed your project using the information available for this analysis.
        </p>

        <div className="runtime-v2-result-panel-meta">
          <span>{meta.runtimeVersion}</span>
          <span>{meta.pipeline}</span>
          <span>{formatDateTime(meta.generatedAt)}</span>
        </div>
      </div>

      <div className="runtime-v2-result-panel-grid">
        <RuntimeV2ResultCard
          title="Summary"
          label={data.summary.focus}
          body={data.summary.text}
        />

        <RuntimeV2ResultCard
          title="Question"
          label="Next reflection"
          body={data.question.question}
          footer={data.question.reason}
        />

        <RuntimeV2ResultCard
          title="Coaching"
          label={data.coaching.suggestedFocus}
          body={data.coaching.nextAction}
          footer={data.coaching.rationale}
        />

        <RuntimeV2ResultCard
          title="Decision Review"
          label="Reasoning quality"
          body={data.decisionReview.decisionSummary}
          footer={[
            `Strength: ${data.decisionReview.strength}`,
            `Risk: ${data.decisionReview.risk}`,
            `Question: ${data.decisionReview.improvementQuestion}`,
          ]}
        />
      </div>
    </section>
  );
}

type RuntimeV2ResultCardProps = {
  title: string;
  label: string;
  body: string;
  footer?: string | string[];
};

function RuntimeV2ResultCard({
  title,
  label,
  body,
  footer,
}: RuntimeV2ResultCardProps) {
  return (
    <article className="runtime-v2-result-card">
      <span className="runtime-v2-result-card-eyebrow">
        {title}
      </span>

      <strong>{label}</strong>

      <p>{body}</p>

      {Array.isArray(footer) ? (
        <ul className="runtime-v2-result-card-footer-list">
          {footer.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : footer ? (
        <small>{footer}</small>
      ) : null}
    </article>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}