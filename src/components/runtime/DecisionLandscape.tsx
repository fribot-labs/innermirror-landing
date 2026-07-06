import type { RuntimeDecisionEvolution } from "../../types/runtimeContractV2";

type DecisionLandscapeProps = {
  decisionEvolution: RuntimeDecisionEvolution;
};

type DecisionStageKey =
  | "implementation-centered"
  | "structure-centered"
  | "user-experience-centered"
  | "runtime-intelligence-centered";

type DecisionLandscapeItem = {
  key: DecisionStageKey;
  label: string;
  score: number;
};

export function DecisionLandscape({
  decisionEvolution,
}: DecisionLandscapeProps) {
  const items = createDecisionLandscapeItems(decisionEvolution);

  return (
    <section className="decision-landscape">
      <div className="decision-landscape-header">
        <span>Decision Landscape</span>

        <h3>Decision direction map</h3>

        <p>
          This map shows how the recent decision direction is distributed across
          implementation, structure, user experience, and Runtime intelligence.
        </p>
      </div>

      <div className="decision-landscape-list">
        {items.map((item) => (
          <div key={item.key} className="decision-landscape-row">
            <div className="decision-landscape-row-label">
              <span>{item.label}</span>
              <strong>{item.score}</strong>
            </div>

            <div className="decision-landscape-bar">
              <div
                className="decision-landscape-bar-fill"
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="decision-landscape-current">
        <span>Current direction</span>
        <strong>{formatDecisionStage(decisionEvolution.currentStage)}</strong>
      </div>
    </section>
  );
}

function createDecisionLandscapeItems(
  decisionEvolution: RuntimeDecisionEvolution
): DecisionLandscapeItem[] {
  const scores: Record<DecisionStageKey, number> = {
    "implementation-centered": 15,
    "structure-centered": 15,
    "user-experience-centered": 15,
    "runtime-intelligence-centered": 15,
  };

  addStageScore(scores, decisionEvolution.earlierStage, 15);
  addStageScore(scores, decisionEvolution.recentStage, 25);
  addStageScore(scores, decisionEvolution.currentStage, 35);

  return [
    {
      key: "implementation-centered",
      label: "Implementation",
      score: scores["implementation-centered"],
    },
    {
      key: "structure-centered",
      label: "Structure",
      score: scores["structure-centered"],
    },
    {
      key: "user-experience-centered",
      label: "User Experience",
      score: scores["user-experience-centered"],
    },
    {
      key: "runtime-intelligence-centered",
      label: "Runtime Intelligence",
      score: scores["runtime-intelligence-centered"],
    },
  ];
}

function addStageScore(
  scores: Record<DecisionStageKey, number>,
  stage: RuntimeDecisionEvolution["currentStage"],
  value: number
): void {
  if (stage === "implementation-centered") {
    scores["implementation-centered"] += value;
    return;
  }

  if (stage === "structure-centered") {
    scores["structure-centered"] += value;
    return;
  }

  if (stage === "user-experience-centered") {
    scores["user-experience-centered"] += value;
    return;
  }

  if (stage === "runtime-intelligence-centered") {
    scores["runtime-intelligence-centered"] += value;
  }
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