export type RuntimeAdapterErrorCode =
  | "RUNTIME_TIMEOUT"
  | "RUNTIME_NETWORK_ERROR"
  | "RUNTIME_INVALID_RESPONSE"
  | "RUNTIME_SERVER_ERROR"
  | "RUNTIME_UNKNOWN_ERROR";

export class RuntimeAdapterError extends Error {
  code: RuntimeAdapterErrorCode;
  recoverable: boolean;

  constructor(
    code: RuntimeAdapterErrorCode,
    message: string,
    recoverable = true
  ) {
    super(message);

    this.name = "RuntimeAdapterError";
    this.code = code;
    this.recoverable = recoverable;
  }
}