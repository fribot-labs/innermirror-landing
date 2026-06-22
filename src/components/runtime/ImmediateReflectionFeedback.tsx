import type {
    ImmediateReflectionFeedbackData,
} from "../../types/runtimeOptimisticResponse";

type Props = {
  data: ImmediateReflectionFeedbackData;
};

export function ImmediateReflectionFeedback({
  data,
}: Props) {
  if (!data.visible) {
    return null;
  }

  return (
    <section className="immediate-reflection-feedback">
      <div className="immediate-reflection-feedback-indicator" />

      <div>
        <div className="immediate-reflection-feedback-title">
          {data.title}
        </div>

        <div className="immediate-reflection-feedback-message">
          {data.message}
        </div>
      </div>
    </section>
  );
}