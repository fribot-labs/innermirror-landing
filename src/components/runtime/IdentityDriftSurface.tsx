import type {
    IdentityDriftSurfaceData,
} from "../../types/runtimeIdentityDrift";

type Props = {
  data: IdentityDriftSurfaceData;
};

export function IdentityDriftSurface({
  data,
}: Props) {
  if (!data.visible) {
    return null;
  }

  return (
    <section className="identity-drift-surface">
      <div className="identity-drift-eyebrow">
        생각 방향 변화
      </div>

      <div className="identity-drift-title">
        {data.title}
      </div>

      <div className="identity-drift-message">
        {data.message}
      </div>

      {data.driftLabel ? (
        <div className="identity-drift-chip">
          {data.driftLabel}
        </div>
      ) : null}

      {(data.fromLabel || data.toLabel) ? (
        <div className="identity-drift-path">
          <div className="identity-drift-node">
            <span>이전 흐름</span>
            <strong>
              {data.fromLabel ?? "기존 방향"}
            </strong>
          </div>

          <div className="identity-drift-arrow">
            →
          </div>

          <div className="identity-drift-node">
            <span>현재 흐름</span>
            <strong>
              {data.toLabel ?? "새로운 방향"}
            </strong>
          </div>
        </div>
      ) : null}

      {data.driftCue ? (
        <div className="identity-drift-cue">
          {data.driftCue}
        </div>
      ) : null}
    </section>
  );
}