import type {
    LongGapRecoverySurfaceData,
} from "../../types/runtimeLongGapRecovery";

type Props = {
  data: LongGapRecoverySurfaceData;
};

export function LongGapRecoverySurface({
  data,
}: Props) {
  if (!data.visible) {
    return null;
  }

  return (
    <section className="long-gap-recovery-surface">
      <div className="long-gap-recovery-eyebrow">
        오래전 흐름과 연결됨
      </div>

      <div className="long-gap-recovery-title">
        {data.title}
      </div>

      <div className="long-gap-recovery-message">
        {data.message}
      </div>

      {data.timeGapLabel ? (
        <div className="long-gap-recovery-time">
          {data.timeGapLabel}
        </div>
      ) : null}

      {data.recoveredTheme ? (
        <div className="long-gap-recovery-theme">
          {data.recoveredTheme}
        </div>
      ) : null}

      {data.previousReflectionSummary ? (
        <div className="long-gap-recovery-previous">
          <span>이전 흐름</span>
          <p>
            “{data.previousReflectionSummary}”
          </p>
        </div>
      ) : null}

      {data.recoveryCue ? (
        <div className="long-gap-recovery-cue">
          {data.recoveryCue}
        </div>
      ) : null}
    </section>
  );
}