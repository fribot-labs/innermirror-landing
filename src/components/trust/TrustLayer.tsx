import { useState } from "react";

import "./TrustLayer.css";

export function TrustLayer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="trust-layer">

    <button
      className="trust-layer__toggle"
      type="button"
      onClick={() => setExpanded(!expanded)}
    >

      <div className="trust-layer__header">

        <div className="trust-layer__title">

          🛡 Data & Service Trust

        </div>

        {!expanded && (

          <div className="trust-layer__summary">

            <div>
              Your projects remain yours.
            </div>

            <div>
              Analysis begins only when you choose.
            </div>

          </div>

        )}

      </div>

      <span className="trust-layer__arrow">

        {expanded ? "▲" : "▼"}

      </span>

    </button>

      {expanded ? (
        <div className="trust-layer__content">

          <div className="trust-section">

            <h4>YOUR OWNERSHIP</h4>

            <p>
              ✓ GitHub repositories remain under your ownership.
            </p>

            <p>
              ✓ InnerMirror never modifies GitHub repositories.
            </p>

          </div>

          <div className="trust-divider" />

          <div className="trust-section">

            <h4>SERVICE TRANSPARENCY</h4>

            <p>
              ✓ Analysis begins only when you explicitly request it.
            </p>

            <p>
              ✓ Analysis never starts automatically.
            </p>

          </div>

          <div className="trust-divider" />

          <div className="trust-section">

            <h4>CURRENT MVP</h4>

            <ul>

              <li>No continuous monitoring</li>

              <li>No automatic background analysis</li>

              <li>No external LLM analysis</li>

            </ul>

          </div>

          <div className="trust-divider" />

          <div className="trust-layer__links">

            <a
              href="/PRIVACY.md"
              target="_blank"
              rel="noreferrer"
            >
              Privacy
            </a>

            <a
              href="/docs/DATA_OWNERSHIP.md"
              target="_blank"
              rel="noreferrer"
            >
              Data Ownership
            </a>

          </div>

        </div>
      ) : null}

    </section>
  );
}