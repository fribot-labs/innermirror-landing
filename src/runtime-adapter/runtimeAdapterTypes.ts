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
  continuityScore: number;
  continuityEvolution: SessionContinuityEvolution;
  continuityScoreSnapshot: SessionContinuityScoreSnapshot;
  driftStrength: DriftStrength;
  driftDirection: DriftDirection;
  driftSnapshot: ReflectionDriftSnapshot;
  adaptivePacing?: AdaptivePacingSnapshot;
  latestMemoryId?: string;
  updatedAt: string;
};

export type SessionContinuityEvolution =
  | "insufficient"
  | "forming"
  | "deepening"
  | "stable"
  | "fragmented";

export type SessionContinuityScoreSnapshot = {
  score: number;
  evolution: SessionContinuityEvolution;
  reflectionCount: number;
  averageStrengthScore: number;
  generatedAt: string;
  note: string;
};

export type DriftStrength =
  | "none"
  | "minor"
  | "moderate"
  | "strong";

export type DriftDirection =
  | "stable"
  | "branching"
  | "fragmenting"
  | "resetting";

export type ReflectionDriftSnapshot = {
  strength: DriftStrength;
  direction: DriftDirection;
  keywordOverlapRatio: number;
  comparedReflectionCount: number;
  generatedAt: string;
  note: string;
};

export type AdaptivePacingMode =
  | "clarify"
  | "continue"
  | "deepen"
  | "stabilize"
  | "recover";

export type AdaptivePacingReason =
  | "brief-reflection"
  | "stable-continuity"
  | "deepening-continuity"
  | "minor-drift"
  | "strong-drift"
  | "fragmented-flow";

export type AdaptivePacingSnapshot = {
  mode: AdaptivePacingMode;
  reason: AdaptivePacingReason;
  label: string;
  guidance: string;
  confidence: number;
  generatedAt: string;
};