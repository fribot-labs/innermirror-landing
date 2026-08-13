export function isRuntimeMemoryTimelineEnabled(
  isProduction:
    boolean = import.meta.env.PROD
): boolean {
  return !isProduction;
}