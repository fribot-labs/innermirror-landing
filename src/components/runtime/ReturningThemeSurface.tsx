import type {
    ReturningThemeSurfaceData,
} from "../../types/runtimeReturningTheme";

type Props = {
  data: ReturningThemeSurfaceData;
};

export function ReturningThemeSurface({
  data,
}: Props) {
  if (!data.visible) {
    return null;
  }

  return (
    <section className="returning-theme-surface">
      <div className="returning-theme-eyebrow">
        반복 등장하는 주제
      </div>

      <div className="returning-theme-title">
        {data.title}
      </div>

      <div className="returning-theme-message">
        {data.message}
      </div>

      {data.themeLabel ? (
        <div className="returning-theme-chip">
          {data.themeLabel}
        </div>
      ) : null}

      {data.occurrenceLabel ? (
        <div className="returning-theme-occurrence">
          {data.occurrenceLabel}
        </div>
      ) : null}

      {data.emotionalCue ? (
        <div className="returning-theme-cue">
          {data.emotionalCue}
        </div>
      ) : null}
    </section>
  );
}