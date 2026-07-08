import type {
  RuntimeCompressedConcept,
  RuntimeKnowledgeCompression,
} from "../../types/runtimeContractV2";

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

        {knowledgeCompression.semanticSummary ? (
          <div className="knowledge-compression-semantic-summary">
            <span>Semantic Summary</span>

            <strong>{knowledgeCompression.semanticSummary}</strong>
          </div>
        ) : null}

        {knowledgeCompression.dominantConcept ||
        knowledgeCompression.growingConcept ? (
          <div className="knowledge-compression-key-concepts">
            {knowledgeCompression.dominantConcept ? (
              <div>
                <span>Dominant Concept</span>

                <strong>
                  {knowledgeCompression.dominantConcept}
                </strong>
              </div>
            ) : null}

            {knowledgeCompression.growingConcept ? (
              <div>
                <span>Growing Concept</span>

                <strong>
                  {knowledgeCompression.growingConcept}
                </strong>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="knowledge-compression-overview-grid">
          <div className="knowledge-compression-ratio">
            <span>Compression Ratio</span>

            <strong>
              {formatCompressionRatio(
                knowledgeCompression.compressionRatio
              )}
            </strong>
          </div>

          {knowledgeCompression.compressionQuality ? (
            <div className="knowledge-compression-quality">
              <span>Compression Quality</span>

              <strong>
                {knowledgeCompression.compressionQuality}
              </strong>
            </div>
          ) : null}
        </div>
      </div>

      {knowledgeCompression.concepts.length > 0 ? (
        <details className="knowledge-compression-concepts-advanced">
          <summary>View compressed concepts</summary>

          <div className="knowledge-compression-concept-list">
            {knowledgeCompression.concepts.map(
              (concept, index) => (
                <article
                  key={`concept-${index}-${concept.concept}`}
                  className="knowledge-compression-concept-card"
                >
                  <div>
                    <span>{concept.concept}</span>

                    <strong>{concept.weight}%</strong>
                  </div>

                  {concept.semanticRole ||
                  concept.trend ? (
                    <small>
                      {concept.semanticRole
                        ? `Role: ${formatConceptRole(
                            concept.semanticRole
                          )}`
                        : ""}

                      {concept.semanticRole &&
                      concept.trend
                        ? " · "
                        : ""}

                      {concept.trend
                        ? `Trend: ${formatConceptTrend(
                            concept.trend
                          )}`
                        : ""}
                    </small>
                  ) : null}

                  <div className="knowledge-compression-bar">
                    <div
                      className="knowledge-compression-bar-fill"
                      style={{
                        width: `${concept.weight}%`,
                      }}
                    />
                  </div>

                  <small>
                    {concept.sourceCount} source records
                  </small>

                  {concept.explanation ? (
                    <p className="knowledge-compression-concept-explanation">
                      {concept.explanation}
                    </p>
                  ) : null}
                </article>
              )
            )}
          </div>
        </details>
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

function formatCompressionRatio(value: string): string {
  return value.replace("sources", "records");
}

function formatConceptRole(
  role: RuntimeCompressedConcept["semanticRole"]
): string {
  if (role === "dominant") {
    return "Dominant";
  }

  if (role === "growing") {
    return "Growing";
  }

  if (role === "stabilizing") {
    return "Stabilizing";
  }

  if (role === "declining") {
    return "Declining";
  }

  return "Emerging";
}

function formatConceptTrend(
  trend: RuntimeCompressedConcept["trend"]
): string {
  if (trend === "rising") {
    return "Rising";
  }

  if (trend === "stable") {
    return "Stable";
  }

  if (trend === "falling") {
    return "Falling";
  }

  return "Early";
}