import type {
    RuntimeV2RecommendationConfidence,
    RuntimeV2RecommendationInsightPattern,
} from "../types/runtimeV2Recommendation";

/**
 * Runtime Recommendation Insight
 *
 * Presentation-only tone.
 *
 * This value exists only for Landing presentation and must never
 * influence Runtime reasoning.
 */
export type RuntimeV2RecommendationInsightTone =
  | "forming"
  | "stable"
  | "progressing"
  | "transition"
  | "warning"
  | "uncertain";

/**
 * Runtime Recommendation Insight Presentation
 *
 * This is the normalized Landing presentation contract derived from
 * Runtime Recommendation Insight.
 *
 * It intentionally excludes Runtime-only identifiers and internal
 * Recommendation Intelligence details.
 *
 * Landing only presents Runtime output.
 * Landing never recalculates Runtime Insight.
 */
export type RuntimeV2RecommendationInsightPresentation = {
  /**
   * Recommendation Insight headline.
   */
  headline: string;

  /**
   * High-level explanation.
   */
  summary: string;

  /**
   * Most important Runtime conclusion.
   */
  keyInsight: string;

  /**
   * Runtime-generated supporting reasons.
   *
   * This array is copied from the Runtime response so that the
   * Presentation layer never mutates Runtime data.
   */
  supportingReasons: string[];

  /**
   * Original Runtime Insight pattern.
   *
   * Kept for UI behavior and testing.
   */
  pattern:
    RuntimeV2RecommendationInsightPattern;

  /**
   * User-facing label.
   *
   * Example:
   *
   * stable-and-aligned
   *
   * ↓
   *
   * Stable and aligned
   */
  patternLabel: string;

  /**
   * Original Runtime confidence.
   */
  confidence:
    RuntimeV2RecommendationConfidence;

  /**
   * User-facing confidence label.
   *
   * Example:
   *
   * High confidence
   */
  confidenceLabel: string;

  /**
   * Presentation tone.
   *
   * Used only by CSS.
   */
  tone:
    RuntimeV2RecommendationInsightTone;

  /**
   * Number of Runtime evidence items.
   *
   * Landing intentionally exposes only the count rather than
   * the raw Runtime Evidence objects.
   */
  evidenceCount: number;

  /**
   * Runtime-generated timestamp.
   */
  generatedAt: string;

  /**
   * User-friendly timestamp.
   */
  generatedAtLabel: string;
};