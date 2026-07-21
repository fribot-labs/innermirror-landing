export type RuntimeEvidenceSource =
  | "project-state"
  | "github-snapshot"
  | "reflection-state"
  | "recommended-focus"
  | "adaptive-coaching"
  | "next-question"
  | "decision-review"
  | "next-interpretation"
  | "continuity"
  | "fallback";

export type RuntimeEvidenceImportance =
  | "primary"
  | "supporting"
  | "context";

export type RuntimeEvidenceValue =
  | string
  | number
  | boolean;

/**
 * Recommendation Candidate가 생성될 때 함께 보존하는
 * 원시 구조화 Evidence입니다.
 *
 * 이 단계에서는 Candidate가 아직 최종 primary 또는
 * supporting으로 선택되지 않았으므로 importance 필드가 없습니다.
 */
export type RuntimeCandidateEvidence = {
  /**
   * 같은 Evidence를 식별하고 중복을 제거하기 위한
   * 안정적인 내부 ID입니다.
   */
  id: string;

  /**
   * Evidence UI에서 사용할 짧은 이름입니다.
   */
  label: string;

  /**
   * 실제로 관측된 값입니다.
   */
  value: RuntimeEvidenceValue;

  /**
   * 이 값이 추천 판단에서 무엇을 의미하는지 설명합니다.
   */
  description: string;

  /**
   * Evidence가 나온 프로젝트 또는 Runtime 계층입니다.
   */
  source: RuntimeEvidenceSource;
};

/**
 * Recommendation Resolution 이후 사용자에게 공개되는
 * Evidence 항목입니다.
 *
 * Candidate Evidence에 최종 역할인 importance가 추가됩니다.
 */
export type RuntimeEvidenceItem = {
  id: string;
  label: string;
  value: RuntimeEvidenceValue;
  description: string;
  source: RuntimeEvidenceSource;

  importance: RuntimeEvidenceImportance;
};

export type RuntimeEvidenceGroup = {
  /**
   * UI key 및 그룹 식별에 사용하는 ID입니다.
   */
  id: string;

  /**
   * Evidence 그룹의 사용자 표시 이름입니다.
   */
  title: string;

  /**
   * 이 그룹이 최종 Recommendation과 어떤 관계인지 설명합니다.
   */
  description: string;

  /**
   * 그룹에 포함된 구조화 Evidence입니다.
   */
  items: RuntimeEvidenceItem[];
};

export type RuntimeEvidenceExplanation = {
  /**
   * Evidence 영역 상단에 표시하는 한 문장 요약입니다.
   */
  summary: string;

  /**
   * 최종 Recommendation을 직접 결정한 Candidate의 Evidence입니다.
   */
  primary: RuntimeEvidenceGroup;

  /**
   * 같은 행동을 지지한 다른 Candidate들의 Evidence입니다.
   */
  supporting: RuntimeEvidenceGroup[];

  /**
   * 추천 판단에 사용된 일반 프로젝트 상태 Evidence입니다.
   */
  context: RuntimeEvidenceGroup[];

  /**
   * Evidence 공개 수준입니다.
   *
   * MVP에서는 structured를 사용하지만,
   * 향후 요약 전용 presentation을 위해 union을 유지합니다.
   */
  disclosure:
    | "summary"
    | "structured";
};