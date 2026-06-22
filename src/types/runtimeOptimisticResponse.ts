export type ImmediateReflectionStatus =
  | "idle"
  | "recorded"
  | "analyzing"
  | "connecting"
  | "completed"
  | "failed";

export type ImmediateReflectionFeedbackData = {
  visible: boolean;
  status: ImmediateReflectionStatus;
  title: string;
  message: string;
};