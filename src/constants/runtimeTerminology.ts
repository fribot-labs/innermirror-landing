/**
 * InnerMirror Landing user-facing terminology.
 *
 * Keep these labels aligned with:
 *
 * - docs/TERMINOLOGY.md
 * - docs/INFORMATION_ARCHITECTURE.md
 *
 * Internal contract field names do not need to match
 * these user-facing labels.
 */
export const RUNTIME_TERMINOLOGY = {
  reflection: "Reflection",
  currentReflection: "Current Reflection",

  reflectionMemory: "Reflection Memory",
  memoryTimeline: "Memory Timeline",

  projectActivity: "Project Activity",
  projectTimeline: "Project Timeline",
  projectFlow: "Project Flow",

  recurringTheme: "Recurring Theme",
  identityDrift: "Identity Drift",

  runtimeInterpretation: "Runtime Interpretation",
  runtimeMerge: "Runtime Merge",

  origin: "Origin",
  repository: "Repository",
} as const;