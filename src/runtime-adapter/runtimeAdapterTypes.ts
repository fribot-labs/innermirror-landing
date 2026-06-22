export type LandingReflectionInput = {
  content: string;
  createdAt: string;
  source: "landing";
};

export type RuntimeContractVersion = "v1";

export type RuntimeSummary = {
  text: string;
  confidence: number;
};

export type RuntimePacing = {
  level: "low" | "medium" | "high";
  message: string;
};

export type RuntimeNextQuestion = {
  question: string;
  reason: string;
};

export type RuntimeContinuitySignal = {
  status: "new" | "weak" | "forming" | "strong";
  strength: number;
  message: string;
  longGapDays?: number;
  relatedSummary?: string;
  relatedTimeLabel?: string;
  bridgeKind?: "direct-theme" | "weak-signal" | "long-gap" | "returning-theme";
};

export type RuntimeReflectionResult = {
  contractVersion: RuntimeContractVersion;
  reflectionId: string;
  summary: RuntimeSummary;
  pacing: RuntimePacing;
  nextQuestion: RuntimeNextQuestion;
  continuitySignal: RuntimeContinuitySignal;
};

export type RuntimeSuccessResponse = {
  ok: true;
  result: RuntimeReflectionResult;
};

export type RuntimeErrorResponse = {
  ok: false;
  error?: {
    code?: string;
    message?: string;
    recoverable?: boolean;
  };
};

export type RuntimeReflectionResponse =
  | RuntimeSuccessResponse
  | RuntimeErrorResponse;