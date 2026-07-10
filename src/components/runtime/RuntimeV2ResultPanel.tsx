import type {
  RuntimeCoaching,
  RuntimeContractV2Response,
  RuntimeDecisionEvolution,
} from "../../types/runtimeContractV2";
import { DecisionLandscape } from "./DecisionLandscape";
import { KnowledgeCompressionPanel } from "./KnowledgeCompressionPanel";
import { ProjectIdentityPanel } from "./ProjectIdentityPanel";
import { RuntimeInsightSynthesisPanel } from "./RuntimeInsightSynthesisPanel";

type RuntimeV2ResultPanelProps = {
  response: RuntimeContractV2Response;
};

export function RuntimeV2ResultPanel({
  response,
}: RuntimeV2ResultPanelProps) {
  const { meta, data } = response;

  const result = response.data;

  return (
    <section className="runtime-v2-result-panel">
      <div className="runtime-v2-result-panel-header">
        <span className="runtime-v2-result-panel-eyebrow">
          Runtime V2 Result
        </span>

        <h2>Current Runtime Understanding</h2>

        <p>
          Runtime summarizes the current project state, next focus, and the
          clearest reason behind its interpretation.
        </p>

        <div className="runtime-v2-result-panel-meta">
          <span>{meta.runtimeVersion}</span>
          <span>{meta.pipeline}</span>
          <span>{formatDateTime(meta.generatedAt)}</span>
        </div>
      </div>

      {data.insightSynthesis ? (
        <RuntimeInsightSynthesisPanel insight={data.insightSynthesis} />
      ) : null}

      <div className="runtime-v2-interpretation-group-header">
        <span>Runtime Interpretation Layers</span>

        <p>
          These sections explain how Runtime understands the project from identity,
          knowledge, and flow.
        </p>
      </div>

      <div className="runtime-v2-secondary-section">
        {data.projectIdentity ? (
          <ProjectIdentityPanel projectIdentity={data.projectIdentity} />
        ) : null}

        {data.knowledgeCompression ? (
          <KnowledgeCompressionPanel
            knowledgeCompression={data.knowledgeCompression}
          />
        ) : null}
      </div>

      <details className="runtime-v2-advanced-section">
        <summary>View detailed Runtime analysis</summary>

        <details className="runtime-v2-nested-advanced-section">
          <summary>View Runtime summary cards</summary>

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
              title="Adaptive Coaching"
              label={data.coaching.suggestedFocus}
              body={data.coaching.nextAction}
              footer={[
                `Mode: ${formatCoachingMode(data.coaching.mode)}`,
                `Reason: ${
                  data.coaching.adaptiveReason ?? data.coaching.rationale
                }`,
                `Confidence: ${data.coaching.confidence ?? "low"}`,
              ]}
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
        </details>

        {data.projectEvolution ? (
          <section className="runtime-v2-project-evolution">
            <span>Project Evolution</span>

            <h3>{data.projectEvolution.title}</h3>

            <p>{data.projectEvolution.summary}</p>

            {data.projectEvolution.shift ? (
              <p>
                <strong>Shift:</strong> {data.projectEvolution.shift}
              </p>
            ) : null}

            {data.projectEvolution.evidence.length > 0 ? (
              <ul>
                {data.projectEvolution.evidence.map(
                  (item: string, index: number) => (
                    <li key={`project-evolution-${index}-${item}`}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            ) : null}

            {data.projectEvolution.suggestedNextFocus ? (
              <p>
                <strong>Suggested next focus:</strong>{" "}
                {data.projectEvolution.suggestedNextFocus}
              </p>
            ) : null}
          </section>
        ) : null}

        {data.decisionEvolution ? (
          <>
            <section className="runtime-v2-decision-evolution">
              <span>Decision Evolution</span>

              <h3>{data.decisionEvolution.title}</h3>

              <p>{data.decisionEvolution.summary}</p>

              {data.decisionEvolution.shift ? (
                <p>
                  <strong>Shift:</strong>{" "}
                  {data.decisionEvolution.shift}
                </p>
              ) : null}

              <div className="runtime-v2-decision-evolution-grid">
                <div>
                  <span>Previous Decision Style</span>
                  <strong>
                    {formatDecisionStage(
                      data.decisionEvolution.earlierStage
                    )}
                  </strong>
                </div>

                <div>
                  <span>Current Decision Style</span>
                  <strong>
                    {formatDecisionStage(
                      data.decisionEvolution.recentStage
                    )}
                  </strong>
                </div>

                <div>
                  <span>Emerging Decision Style</span>
                  <strong>
                    {formatDecisionStage(
                      data.decisionEvolution.currentStage
                    )}
                  </strong>
                </div>
              </div>

              {data.decisionEvolution.evidence.length > 0 ? (
                <ul>
                  {data.decisionEvolution.evidence.map(
                    (item: string, index: number) => (
                      <li key={`decision-evolution-${index}-${item}`}>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              ) : null}

              {data.decisionEvolution.suggestedReflection ? (
                <p>
                  <strong>Suggested reflection:</strong>{" "}
                  {data.decisionEvolution.suggestedReflection}
                </p>
              ) : null}
            </section>

            <DecisionLandscape
              decisionEvolution={data.decisionEvolution}
            />
          </>
        ) : null}
      </details>
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

function formatCoachingMode(
  mode: RuntimeCoaching["mode"]
): string {
  if (mode === "reflection-needed") {
    return "Reflection needed";
  }

  if (mode === "project-review") {
    return "Project review";
  }

  if (mode === "evolution-review") {
    return "Evolution review";
  }

  if (mode === "next-implementation") {
    return "Next implementation";
  }

  if (mode === "stabilization") {
    return "Stabilization";
  }

  return "General coaching";
}

function formatDecisionStage(
  stage: RuntimeDecisionEvolution["currentStage"]
): string {
  if (stage === "implementation-centered") {
    return "Implementation-centered";
  }

  if (stage === "structure-centered") {
    return "Structure-centered";
  }

  if (stage === "user-experience-centered") {
    return "User experience-centered";
  }

  if (stage === "runtime-intelligence-centered") {
    return "Runtime intelligence-centered";
  }

  return "Unclear";
}