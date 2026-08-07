import type {
    RuntimeProjectContext,
} from "./runtimeProjectContextTypes";

const RUNTIME_PROJECT_CONTEXT_STORAGE_KEY =
  "innermirror.runtimeProjectContext";

export function saveRuntimeProjectContext(
  context: RuntimeProjectContext
): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(
    RUNTIME_PROJECT_CONTEXT_STORAGE_KEY,
    JSON.stringify(context)
  );
}

export function loadRuntimeProjectContext():
  RuntimeProjectContext | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  const storedValue =
    window.localStorage.getItem(
      RUNTIME_PROJECT_CONTEXT_STORAGE_KEY
    );

  if (storedValue === null) {
    return null;
  }

  try {
    const parsedValue =
      JSON.parse(storedValue) as unknown;

    if (!isRuntimeProjectContext(parsedValue)) {
      throw new Error(
        "Stored Runtime Project Context is invalid."
      );
    }

    return parsedValue;
  } catch {
    window.localStorage.removeItem(
      RUNTIME_PROJECT_CONTEXT_STORAGE_KEY
    );

    return null;
  }
}

export function clearRuntimeProjectContext(): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(
    RUNTIME_PROJECT_CONTEXT_STORAGE_KEY
  );
}

function isRuntimeProjectContext(
  value: unknown
): value is RuntimeProjectContext {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const context =
    value as Record<string, unknown>;

  return (
    context.contextVersion === "v1" &&
    typeof context.projectId === "string" &&
    (
      context.kind === "general" ||
      context.kind === "pbl"
    ) &&
    (
      context.learningMode ===
        "general-project" ||
      context.learningMode ===
        "project-based-learning"
    ) &&
    typeof context.createdAt === "string" &&
    typeof context.updatedAt === "string"
  );
}

function canUseLocalStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}