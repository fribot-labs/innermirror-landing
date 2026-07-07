import type {
  RuntimeProjectIdentity,
  RuntimeSemanticConceptRelationship,
} from "../../types/runtimeContractV2";

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

      {projectIdentity.identityEvolution ? (
        <div className="project-identity-evolution">
          <span>Identity Evolution</span>

          <p>{projectIdentity.identityEvolution.transitionSummary}</p>

          <div className="project-identity-evolution-grid">
            <div>
              <span>Previous Identity</span>
              <strong>
                {projectIdentity.identityEvolution.previousIdentity}
              </strong>
            </div>

            <div>
              <span>Current Identity</span>
              <strong>
                {projectIdentity.identityEvolution.currentIdentity}
              </strong>
            </div>

            <div>
              <span>Emerging Identity</span>
              <strong>
                {projectIdentity.identityEvolution.emergingIdentity}
              </strong>
            </div>
          </div>

          {projectIdentity.identityEvolution.evidence.length > 0 ? (
            <ul>
              {projectIdentity.identityEvolution.evidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {projectIdentity.semanticRelationships &&
      projectIdentity.semanticRelationships.length > 0 ? (
        <div className="project-identity-relationships">
          <span>Semantic Relationships</span>

          <div className="project-identity-relationship-list">
            {projectIdentity.semanticRelationships.map((relationship) => (
              <article
                key={`${relationship.from}-${relationship.to}`}
                className="project-identity-relationship-card"
              >
                <strong>
                  {relationship.from} → {relationship.to}
                </strong>

                <small>{formatRelationshipType(relationship.relationship)}</small>

                <p>{relationship.explanation}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

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

function formatRelationshipType(
  relationship: RuntimeSemanticConceptRelationship["relationship"]
): string {
  if (relationship === "supports") {
    return "Supports";
  }

  if (relationship === "extends") {
    return "Extends";
  }

  if (relationship === "stabilizes") {
    return "Stabilizes";
  }

  return "Transitions to";
}