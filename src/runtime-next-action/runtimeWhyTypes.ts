export type RuntimeWhyPriority =
  | "blocking"
  | "primary"
  | "reinforced"
  | "fallback";

export type RuntimeWhyExplanation = {
  /**
   * 사용자에게 가장 먼저 보여주는
   * 핵심 추천 이유입니다.
   */
  summary: string;

  /**
   * 현재 프로젝트 상태와 추천 행동 사이의
   * 관계를 설명합니다.
   */
  context: string;

  /**
   * 왜 이 행동이 다른 행동보다
   * 먼저 수행되어야 하는지 설명합니다.
   */
  priorityReason: string;

  /**
   * 추천 행동을 수행했을 때
   * 기대되는 변화를 설명합니다.
   */
  expectedOutcome: string;

  /**
   * 추천 이유가 어떤 우선순위 성격을
   * 가지는지 나타냅니다.
   */
  priority: RuntimeWhyPriority;
};