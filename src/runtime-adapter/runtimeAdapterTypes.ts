export type LandingReflectionInput = {
  content: string;
  createdAt: string;
  source: "landing";
};

export type RuntimeMeta = {
  runtimeVersion: string;
  generatedAt: string;
  layer: "private-runtime";
};

export type ReflectionSummary = {
  tone: "empty" | "brief" | "developing" | "substantial";
  text: string;
  description: string;
};

export type ContinuitySignal = {
  strength: "none" | "weak" | "emerging" | "strong";
  label: string;
  description: string;
};

export type PacingHint = {
  mode: "pause" | "continue" | "deepen" | "revisit";
  label: string;
  description: string;
};

export type RuntimeQuestion = {
  intent: "clarify" | "continue" | "deepen" | "preserve";
  question: string;
  reason: string;
};

export type RuntimeReflectionResult = {
  summary: ReflectionSummary;
  continuitySignal: ContinuitySignal;
  pacingHint: PacingHint;
  nextQuestion: RuntimeQuestion;
  session?: RuntimeSessionSnapshot;
};

export type RuntimeSuccessResponse<T> = {
  ok: true;
  meta: RuntimeMeta;
  result: T;
};

export type RuntimeErrorItem = {
  code: string;
  message: string;
  field?: string;
};

export type RuntimeErrorResponse = {
  ok: false;
  meta?: RuntimeMeta;
  errors: RuntimeErrorItem[];
};

export type RuntimeApiResponse<T> =
  | RuntimeSuccessResponse<T>
  | RuntimeErrorResponse;

export type RuntimeSessionSnapshot = {
  sessionId: string;
  status: "active" | "paused" | "closed";
  reflectionCount: number;
  continuityStrength: "none" | "weak" | "emerging" | "strong";
  latestMemoryId?: string;
  updatedAt: string;
};