import type {
    ReflectionContinuitySurfaceData,
} from "../../types/runtimeContinuity";

type Props = {
  data:
    ReflectionContinuitySurfaceData;
};

export function ReflectionContinuitySurface({
  data,
}: Props) {
  if (!data.visible) {
    return null;
  }

  return (
    <section className="reflection-continuity-surface">
      <div className="reflection-continuity-header">
        지난번 생각과 연결됩니다
      </div>

      <div className="reflection-continuity-message">
        {data.message}
      </div>

      {data.relatedReflection && (
        <div className="reflection-continuity-related">
          <div className="reflection-continuity-related-label">
            연결된 흐름
          </div>

          <div className="reflection-continuity-related-summary">
            "
            {
              data.relatedReflection
                .summary
            }
            "
          </div>

          <div className="reflection-continuity-related-time">
            {
              data.relatedReflection
                .timeLabel
            }
          </div>
        </div>
      )}
    </section>
  );
}