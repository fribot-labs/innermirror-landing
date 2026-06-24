export type RuntimeBoundaryStatus =
  | "healthy"
  | "degraded"
  | "unavailable";

export type RuntimeBoundaryCheckStatus =
  | "pass"
  | "warn"
  | "fail";

export type RuntimeBoundaryCheck = {
  name: string;
  status: RuntimeBoundaryCheckStatus;
  message: string;
  details?: Record<string, unknown>;
};

export type RuntimeBoundaryHealthResult = {
  status: RuntimeBoundaryStatus;
  checks: RuntimeBoundaryCheck[];
  generatedAt: string;
};

export type RuntimeBoundaryHealthResponse = {
  ok: boolean;
  result?: RuntimeBoundaryHealthResult;
  error?: {
    code?: string;
    message?: string;
  };
};