import type { RuntimeAdapterError } from "../runtime-adapter/runtimeAdapterErrors";

type RuntimeErrorStateProps = {
  error: RuntimeAdapterError;
  onRetry?: () => void;
};

export function RuntimeErrorState({
  error,
  onRetry,
}: RuntimeErrorStateProps) {
  return (
    <div className="runtime-error-state">
      <strong>Runtime connection issue</strong>
      <p>{error.message}</p>

      {error.recoverable && onRetry !== undefined ? (
        <button
          type="button"
          onClick={onRetry}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}