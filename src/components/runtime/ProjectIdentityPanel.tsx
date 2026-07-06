import type { RuntimeProjectIdentity } from "../../types/runtimeContractV2";

type ProjectIdentityPanelProps = {
  projectIdentity: RuntimeProjectIdentity;
};

export function ProjectIdentityPanel({
  projectIdentity,
}: ProjectIdentityPanelProps) {
  return (
    <section className="project-identity-panel">
      <div className="project-identity-panel-header">
        <span>Project Identity</span>

        <h3>{projectIdentity.title}</h3>

        <p>{projectIdentity.summary}</p>
      </div>

      <div className="project-identity-panel-statement">
        <span>Current Identity</span>
        <strong>{formatCurrentIdentity(projectIdentity.stage)}</strong>
      </div>

      <div className="project-identity-panel-grid">
        <div>
          <span>Identity Stage</span>
          <strong>{formatProjectIdentityStage(projectIdentity.stage)}</strong>
        </div>

        <div>
          <span>Confidence</span>
          <strong>{projectIdentity.confidence}</strong>
        </div>
      </div>

      {projectIdentity.identitySignals.length > 0 ? (
        <ul>
          {projectIdentity.identitySignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      ) : null}

      {projectIdentity.suggestedNextIdentityAction ? (
        <p className="project-identity-panel-action">
          <strong>Suggested next identity action:</strong>{" "}
          {projectIdentity.suggestedNextIdentityAction}
        </p>
      ) : null}
    </section>
  );
}

function formatProjectIdentityStage(
  stage: RuntimeProjectIdentity["stage"]
): string {
  if (stage === "implementation-building") {
    return "Implementation";
  }

  if (stage === "ux-stabilization") {
    return "User Experience";
  }

  if (stage === "runtime-intelligence-building") {
    return "Runtime Intelligence";
  }

  if (stage === "knowledge-compression") {
    return "Knowledge Compression";
  }

  if (stage === "project-structure-formation") {
    return "Project Architecture";
  }

  if (stage === "early-formation") {
    return "Early Formation";
  }

  return "Unclear";
}

function formatCurrentIdentity(
  stage: RuntimeProjectIdentity["stage"]
): string {
  if (stage === "implementation-building") {
    return "Building Implementation";
  }

  if (stage === "ux-stabilization") {
    return "Stabilizing User Experience";
  }

  if (stage === "runtime-intelligence-building") {
    return "Building Runtime Intelligence";
  }

  if (stage === "knowledge-compression") {
    return "Compressing Project Knowledge";
  }

  if (stage === "project-structure-formation") {
    return "Forming Project Architecture";
  }

  if (stage === "early-formation") {
    return "Forming Project Identity";
  }

  return "Identity Still Unclear";
}