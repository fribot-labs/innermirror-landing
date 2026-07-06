import type { RuntimeKnowledgeCompression } from "../../types/runtimeContractV2";

type KnowledgeCompressionPanelProps = {
  knowledgeCompression: RuntimeKnowledgeCompression;
};

export function KnowledgeCompressionPanel({
  knowledgeCompression,
}: KnowledgeCompressionPanelProps) {
  return (
    <section className="knowledge-compression-panel">
      <div className="knowledge-compression-panel-header">
        <span>Knowledge Compression</span>

        <h3>{knowledgeCompression.title}</h3>

        <p>{knowledgeCompression.summary}</p>

        <small>{knowledgeCompression.compressionRatio}</small>
      </div>

      {knowledgeCompression.concepts.length > 0 ? (
        <div className="knowledge-compression-concept-list">
          {knowledgeCompression.concepts.map((concept) => (
            <article
              key={concept.concept}
              className="knowledge-compression-concept-card"
            >
              <div>
                <span>{concept.concept}</span>
                <strong>{concept.weight}</strong>
              </div>

              <div className="knowledge-compression-bar">
                <div
                  className="knowledge-compression-bar-fill"
                  style={{ width: `${concept.weight}%` }}
                />
              </div>

              <small>
                {concept.sourceCount} source records
              </small>
            </article>
          ))}
        </div>
      ) : null}

      {knowledgeCompression.suggestedReflection ? (
        <p className="knowledge-compression-suggested-reflection">
          <strong>Suggested reflection:</strong>{" "}
          {knowledgeCompression.suggestedReflection}
        </p>
      ) : null}
    </section>
  );
}