import type {
    RuntimeRecommendationCandidate,
    RuntimeRecommendationScoredCandidate,
} from "./createRuntimeRecommendationCandidateScore";

import type {
    RuntimeRecommendationQualityProfile,
    RuntimeRecommendationQualityProfileMap,
} from "./runtimeRecommendationQualityTypes";

/* ------------------------------------------------------------------ */
/* Resolution Reason */
/* ------------------------------------------------------------------ */

/**
 * Candidate와 Quality Profile의 연결 결과를 설명합니다.
 */
export type RuntimeRecommendationQualityProfileResolutionReason =
  | "matched-by-explicit-fingerprint"
  | "matched-by-candidate-id"
  | "matched-by-structural-identity"
  | "matched-by-structural-identity-and-title"
  | "missing-project-id"
  | "empty-profile-map"
  | "no-matching-profile"
  | "ambiguous-structural-match";

/* ------------------------------------------------------------------ */
/* Match Strategy */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationQualityProfileMatchStrategy =
  | "explicit-fingerprint"
  | "candidate-id"
  | "structural-identity"
  | "structural-identity-and-title"
  | "none";

/* ------------------------------------------------------------------ */
/* Match Candidate Diagnostics */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationQualityProfileMatchDiagnostic = {
  fingerprint:
    string;

  projectMatches:
    boolean;

  kindMatches:
    boolean;

  targetMatches:
    boolean;

  sourceMatches:
    boolean;

  titleMatches:
    boolean;

  structuralMatch:
    boolean;

  exactMatch:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Resolution Diagnostics */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationQualityProfileResolutionDiagnostics = {
  projectId:
    string | null;

  candidateId:
    string;

  explicitFingerprint:
    string | null;

  attemptedLookupKeys:
    string[];

  profileCount:
    number;

  structurallyMatchedProfileCount:
    number;

  exactMatchedProfileCount:
    number;

  selectedFingerprint:
    string | null;

  matchStrategy:
    RuntimeRecommendationQualityProfileMatchStrategy;

  reason:
    RuntimeRecommendationQualityProfileResolutionReason;

  matches:
    RuntimeRecommendationQualityProfileMatchDiagnostic[];

  warnings:
    string[];
};

/* ------------------------------------------------------------------ */
/* Resolution Result */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationQualityProfileResolution = {
  fingerprint:
    string | null;

  profile:
    RuntimeRecommendationQualityProfile | null;

  matched:
    boolean;

  matchStrategy:
    RuntimeRecommendationQualityProfileMatchStrategy;

  reason:
    RuntimeRecommendationQualityProfileResolutionReason;

  diagnostics:
    RuntimeRecommendationQualityProfileResolutionDiagnostics;
};

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type ResolveRuntimeRecommendationQualityProfileParams = {
  /**
   * Quality Profile을 조회할 Recommendation Candidate입니다.
   */
  candidate:
    RuntimeRecommendationCandidate;

  /**
   * 현재 Candidate가 속한 프로젝트입니다.
   */
  projectId:
    string | null;

  /**
   * PR-046A Quality Analysis에서 생성한 Profile Map입니다.
   */
  profileMap:
    RuntimeRecommendationQualityProfileMap;

  /**
   * Runtime Action History에서 이미 생성한 fingerprint를 알고 있다면
   * 전달할 수 있습니다.
   *
   * 이 값이 존재하면 가장 먼저 직접 Map lookup을 수행합니다.
   */
  fingerprint?:
    string | null;
};

export type ResolveScoredRuntimeRecommendationQualityProfileParams = {
  scoredCandidate:
    RuntimeRecommendationScoredCandidate;

  projectId:
    string | null;

  profileMap:
    RuntimeRecommendationQualityProfileMap;

  fingerprint?:
    string | null;
};

/* ------------------------------------------------------------------ */
/* Public Resolver */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Candidate에 대응하는 Quality Profile을 조회합니다.
 *
 * 조회 순서:
 *
 * 1. 외부에서 전달된 explicit fingerprint
 * 2. Candidate ID를 key로 한 직접 조회
 * 3. projectId + kind + target + source + title
 * 4. projectId + kind + target + source
 *
 * 이 함수는 다음을 수행하지 않습니다.
 *
 * - Adaptive Modifier 계산
 * - Base Score 변경
 * - Candidate 선택
 * - RuntimeNextAction 변경
 */
export function resolveRuntimeRecommendationQualityProfile({
  candidate,
  projectId,
  profileMap,
  fingerprint,
}: ResolveRuntimeRecommendationQualityProfileParams):
  RuntimeRecommendationQualityProfileResolution {
  const normalizedProjectId =
    normalizeRequiredText(
      projectId
    );

  const normalizedExplicitFingerprint =
    normalizeRequiredText(
      fingerprint
    );

  const normalizedCandidateId =
    normalizeRequiredText(
      candidate.id
    ) ??
    "unknown-candidate";

  const profileEntries =
    normalizeProfileEntries(
      profileMap
    );

  const attemptedLookupKeys =
    createAttemptedLookupKeys({
      explicitFingerprint:
        normalizedExplicitFingerprint,

      candidateId:
        normalizedCandidateId,
    });

  if (
    normalizedProjectId === null
  ) {
    return createUnmatchedResolution({
      projectId:
        null,

      candidate,

      explicitFingerprint:
        normalizedExplicitFingerprint,

      attemptedLookupKeys,

      profileEntries,

      reason:
        "missing-project-id",

      warnings: [
        "Quality Profile resolution requires a valid projectId.",
      ],
    });
  }

  if (
    profileEntries.length === 0
  ) {
    return createUnmatchedResolution({
      projectId:
        normalizedProjectId,

      candidate,

      explicitFingerprint:
        normalizedExplicitFingerprint,

      attemptedLookupKeys,

      profileEntries,

      reason:
        "empty-profile-map",

      warnings: [
        "The Recommendation Quality Profile Map is empty.",
      ],
    });
  }

  /*
   * STEP 1
   *
   * Runtime Action History가 생성한 fingerprint를 외부에서 전달한 경우,
   * 가장 신뢰할 수 있는 직접 조회 방식입니다.
   */
  if (
    normalizedExplicitFingerprint !== null
  ) {
    const explicitProfile =
      profileMap[
        normalizedExplicitFingerprint
      ];

    if (
      explicitProfile !== undefined &&
      doesProfileBelongToProject(
        explicitProfile,
        normalizedProjectId
      )
    ) {
      return createMatchedResolution({
        projectId:
          normalizedProjectId,

        candidate,

        explicitFingerprint:
          normalizedExplicitFingerprint,

        attemptedLookupKeys,

        profileEntries,

        selectedFingerprint:
          normalizedExplicitFingerprint,

        selectedProfile:
          explicitProfile,

        matchStrategy:
          "explicit-fingerprint",

        reason:
          "matched-by-explicit-fingerprint",
      });
    }
  }

  /*
   * STEP 2
   *
   * 일부 Profile Map 구현이 Candidate ID를 key로 사용할 가능성을
   * 보존하기 위한 호환 lookup입니다.
   */
  const candidateIdProfile =
    profileMap[
      normalizedCandidateId
    ];

  if (
    candidateIdProfile !== undefined &&
    doesProfileBelongToProject(
      candidateIdProfile,
      normalizedProjectId
    ) &&
    doesProfileStructurallyMatchCandidate(
      candidateIdProfile,
      candidate
    )
  ) {
    return createMatchedResolution({
      projectId:
        normalizedProjectId,

      candidate,

      explicitFingerprint:
        normalizedExplicitFingerprint,

      attemptedLookupKeys,

      profileEntries,

      selectedFingerprint:
        candidateIdProfile
          .identity
          .fingerprint,

      selectedProfile:
        candidateIdProfile,

      matchStrategy:
        "candidate-id",

      reason:
        "matched-by-candidate-id",
    });
  }

  /*
   * STEP 3
   *
   * fingerprint 문자열 형식에 의존하지 않고,
   * Quality Profile 내부 Identity와 Candidate Action을 비교합니다.
   */
  const matchDiagnostics =
    profileEntries.map(
      ({ fingerprint, profile }) =>
        createMatchDiagnostic({
          fingerprint,

          profile,

          candidate,

          projectId:
            normalizedProjectId,
        })
    );

  const exactMatches =
    profileEntries.filter(
      (
        entry,
        index
      ) =>
        matchDiagnostics[
          index
        ].exactMatch
    );

  if (
    exactMatches.length === 1
  ) {
    const selected =
      exactMatches[0];

    return createMatchedResolution({
      projectId:
        normalizedProjectId,

      candidate,

      explicitFingerprint:
        normalizedExplicitFingerprint,

      attemptedLookupKeys,

      profileEntries,

      selectedFingerprint:
        selected.fingerprint,

      selectedProfile:
        selected.profile,

      matchStrategy:
        "structural-identity-and-title",

      reason:
        "matched-by-structural-identity-and-title",

      matchDiagnostics,
    });
  }

  const structuralMatches =
    profileEntries.filter(
      (
        entry,
        index
      ) =>
        matchDiagnostics[
          index
        ].structuralMatch
    );

  if (
    structuralMatches.length === 1
  ) {
    const selected =
      structuralMatches[0];

    return createMatchedResolution({
      projectId:
        normalizedProjectId,

      candidate,

      explicitFingerprint:
        normalizedExplicitFingerprint,

      attemptedLookupKeys,

      profileEntries,

      selectedFingerprint:
        selected.fingerprint,

      selectedProfile:
        selected.profile,

      matchStrategy:
        "structural-identity",

      reason:
        "matched-by-structural-identity",

      matchDiagnostics,
    });
  }

  /*
   * 동일 구조의 Profile이 여러 개 존재하는 경우에는 추측하여 하나를
   * 선택하지 않습니다.
   *
   * 잘못된 History가 Adaptive Modifier에 적용되는 것보다
   * Modifier를 0으로 유지하는 편이 Shadow Mode에서 안전합니다.
   */
  if (
    structuralMatches.length > 1
  ) {
    return createUnmatchedResolution({
      projectId:
        normalizedProjectId,

      candidate,

      explicitFingerprint:
        normalizedExplicitFingerprint,

      attemptedLookupKeys,

      profileEntries,

      reason:
        "ambiguous-structural-match",

      matchDiagnostics,

      warnings: [
        `Multiple Quality Profiles matched candidate "${normalizedCandidateId}" by structural identity.`,
        "No profile was selected because the match was ambiguous.",
      ],
    });
  }

  return createUnmatchedResolution({
    projectId:
      normalizedProjectId,

    candidate,

    explicitFingerprint:
      normalizedExplicitFingerprint,

    attemptedLookupKeys,

    profileEntries,

    reason:
      "no-matching-profile",

    matchDiagnostics,

    warnings: [
      `No Quality Profile matched candidate "${normalizedCandidateId}".`,
    ],
  });
}

/* ------------------------------------------------------------------ */
/* Scored Candidate Convenience Resolver */
/* ------------------------------------------------------------------ */

/**
 * RuntimeRecommendationScoredCandidate를 직접 전달할 수 있는
 * 편의 Resolver입니다.
 */
export function resolveScoredRuntimeRecommendationQualityProfile({
  scoredCandidate,
  projectId,
  profileMap,
  fingerprint,
}: ResolveScoredRuntimeRecommendationQualityProfileParams):
  RuntimeRecommendationQualityProfileResolution {
  return resolveRuntimeRecommendationQualityProfile({
    candidate:
      scoredCandidate.candidate,

    projectId,

    profileMap,

    fingerprint,
  });
}

/* ------------------------------------------------------------------ */
/* Batch Resolver */
/* ------------------------------------------------------------------ */

export type ResolveRuntimeRecommendationQualityProfilesParams = {
  candidates:
    RuntimeRecommendationCandidate[];

  projectId:
    string | null;

  profileMap:
    RuntimeRecommendationQualityProfileMap;

  /**
   * Candidate ID별 explicit fingerprint Map입니다.
   */
  fingerprintByCandidateId?:
    Record<
      string,
      string | null | undefined
    >;
};

export type RuntimeRecommendationQualityProfileResolutionMap =
  Record<
    string,
    RuntimeRecommendationQualityProfileResolution
  >;

/**
 * Candidate 배열 전체의 Quality Profile을 조회합니다.
 */
export function resolveRuntimeRecommendationQualityProfiles({
  candidates,
  projectId,
  profileMap,
  fingerprintByCandidateId = {},
}: ResolveRuntimeRecommendationQualityProfilesParams):
  RuntimeRecommendationQualityProfileResolutionMap {
  const resolutions:
    RuntimeRecommendationQualityProfileResolutionMap = {};

  for (
    const candidate of
    candidates
  ) {
    const candidateId =
      normalizeRequiredText(
        candidate.id
      ) ??
      `candidate-${candidate.generationOrder}`;

    resolutions[
      candidateId
    ] =
      resolveRuntimeRecommendationQualityProfile({
        candidate,

        projectId,

        profileMap,

        fingerprint:
          fingerprintByCandidateId[
            candidateId
          ] ??
          null,
      });
  }

  return resolutions;
}

/* ------------------------------------------------------------------ */
/* Match Diagnostic Builder */
/* ------------------------------------------------------------------ */

type CreateMatchDiagnosticParams = {
  fingerprint:
    string;

  profile:
    RuntimeRecommendationQualityProfile;

  candidate:
    RuntimeRecommendationCandidate;

  projectId:
    string;
};

function createMatchDiagnostic({
  fingerprint,
  profile,
  candidate,
  projectId,
}: CreateMatchDiagnosticParams):
  RuntimeRecommendationQualityProfileMatchDiagnostic {
  const projectMatches =
    normalizeRequiredText(
      profile.identity.projectId
    ) === projectId;

  const kindMatches =
    profile.identity.kind ===
    candidate.action.kind;

  const targetMatches =
    profile.identity.target ===
    candidate.action.target;

  const sourceMatches =
    profile.identity.source ===
    candidate.action.source;

  const titleMatches =
    normalizeComparableText(
      profile.identity.title
    ) ===
    normalizeComparableText(
      candidate.action.title
    );

  const structuralMatch =
    projectMatches &&
    kindMatches &&
    targetMatches &&
    sourceMatches;

  return {
    fingerprint,

    projectMatches,

    kindMatches,

    targetMatches,

    sourceMatches,

    titleMatches,

    structuralMatch,

    exactMatch:
      structuralMatch &&
      titleMatches,
  };
}

/* ------------------------------------------------------------------ */
/* Structural Matching */
/* ------------------------------------------------------------------ */

function doesProfileBelongToProject(
  profile:
    RuntimeRecommendationQualityProfile,
  projectId:
    string
): boolean {
  return (
    normalizeRequiredText(
      profile.identity.projectId
    ) === projectId
  );
}

function doesProfileStructurallyMatchCandidate(
  profile:
    RuntimeRecommendationQualityProfile,
  candidate:
    RuntimeRecommendationCandidate
): boolean {
  return (
    profile.identity.kind ===
      candidate.action.kind &&
    profile.identity.target ===
      candidate.action.target &&
    profile.identity.source ===
      candidate.action.source
  );
}

/* ------------------------------------------------------------------ */
/* Resolution Builders */
/* ------------------------------------------------------------------ */

type RuntimeRecommendationProfileEntry = {
  fingerprint:
    string;

  profile:
    RuntimeRecommendationQualityProfile;
};

type CreateMatchedResolutionParams = {
  projectId:
    string;

  candidate:
    RuntimeRecommendationCandidate;

  explicitFingerprint:
    string | null;

  attemptedLookupKeys:
    string[];

  profileEntries:
    RuntimeRecommendationProfileEntry[];

  selectedFingerprint:
    string;

  selectedProfile:
    RuntimeRecommendationQualityProfile;

  matchStrategy:
    Exclude<
      RuntimeRecommendationQualityProfileMatchStrategy,
      "none"
    >;

  reason:
    Exclude<
      RuntimeRecommendationQualityProfileResolutionReason,
      | "missing-project-id"
      | "empty-profile-map"
      | "no-matching-profile"
      | "ambiguous-structural-match"
    >;

  matchDiagnostics?:
    RuntimeRecommendationQualityProfileMatchDiagnostic[];
};

function createMatchedResolution({
  projectId,
  candidate,
  explicitFingerprint,
  attemptedLookupKeys,
  profileEntries,
  selectedFingerprint,
  selectedProfile,
  matchStrategy,
  reason,
  matchDiagnostics,
}: CreateMatchedResolutionParams):
  RuntimeRecommendationQualityProfileResolution {
  const diagnostics =
    matchDiagnostics ??
    profileEntries.map(
      ({ fingerprint, profile }) =>
        createMatchDiagnostic({
          fingerprint,

          profile,

          candidate,

          projectId,
        })
    );

  return {
    fingerprint:
      selectedFingerprint,

    profile:
      selectedProfile,

    matched:
      true,

    matchStrategy,

    reason,

    diagnostics:
      createResolutionDiagnostics({
        projectId,

        candidate,

        explicitFingerprint,

        attemptedLookupKeys,

        profileEntries,

        selectedFingerprint,

        matchStrategy,

        reason,

        matchDiagnostics:
          diagnostics,

        warnings:
          [],
      }),
  };
}

type CreateUnmatchedResolutionParams = {
  projectId:
    string | null;

  candidate:
    RuntimeRecommendationCandidate;

  explicitFingerprint:
    string | null;

  attemptedLookupKeys:
    string[];

  profileEntries:
    RuntimeRecommendationProfileEntry[];

  reason:
    Extract<
      RuntimeRecommendationQualityProfileResolutionReason,
      | "missing-project-id"
      | "empty-profile-map"
      | "no-matching-profile"
      | "ambiguous-structural-match"
    >;

  matchDiagnostics?:
    RuntimeRecommendationQualityProfileMatchDiagnostic[];

  warnings:
    string[];
};

function createUnmatchedResolution({
  projectId,
  candidate,
  explicitFingerprint,
  attemptedLookupKeys,
  profileEntries,
  reason,
  matchDiagnostics = [],
  warnings,
}: CreateUnmatchedResolutionParams):
  RuntimeRecommendationQualityProfileResolution {
  return {
    fingerprint:
      null,

    profile:
      null,

    matched:
      false,

    matchStrategy:
      "none",

    reason,

    diagnostics:
      createResolutionDiagnostics({
        projectId,

        candidate,

        explicitFingerprint,

        attemptedLookupKeys,

        profileEntries,

        selectedFingerprint:
          null,

        matchStrategy:
          "none",

        reason,

        matchDiagnostics,

        warnings,
      }),
  };
}

/* ------------------------------------------------------------------ */
/* Diagnostics Builder */
/* ------------------------------------------------------------------ */

type CreateResolutionDiagnosticsParams = {
  projectId:
    string | null;

  candidate:
    RuntimeRecommendationCandidate;

  explicitFingerprint:
    string | null;

  attemptedLookupKeys:
    string[];

  profileEntries:
    RuntimeRecommendationProfileEntry[];

  selectedFingerprint:
    string | null;

  matchStrategy:
    RuntimeRecommendationQualityProfileMatchStrategy;

  reason:
    RuntimeRecommendationQualityProfileResolutionReason;

  matchDiagnostics:
    RuntimeRecommendationQualityProfileMatchDiagnostic[];

  warnings:
    string[];
};

function createResolutionDiagnostics({
  projectId,
  candidate,
  explicitFingerprint,
  attemptedLookupKeys,
  profileEntries,
  selectedFingerprint,
  matchStrategy,
  reason,
  matchDiagnostics,
  warnings,
}: CreateResolutionDiagnosticsParams):
  RuntimeRecommendationQualityProfileResolutionDiagnostics {
  return {
    projectId,

    candidateId:
      normalizeRequiredText(
        candidate.id
      ) ??
      "unknown-candidate",

    explicitFingerprint,

    attemptedLookupKeys,

    profileCount:
      profileEntries.length,

    structurallyMatchedProfileCount:
      matchDiagnostics.filter(
        (match) =>
          match.structuralMatch
      ).length,

    exactMatchedProfileCount:
      matchDiagnostics.filter(
        (match) =>
          match.exactMatch
      ).length,

    selectedFingerprint,

    matchStrategy,

    reason,

    matches:
      matchDiagnostics,

    warnings:
      [...warnings],
  };
}

/* ------------------------------------------------------------------ */
/* Profile Map Normalization */
/* ------------------------------------------------------------------ */

function normalizeProfileEntries(
  profileMap:
    RuntimeRecommendationQualityProfileMap
): RuntimeRecommendationProfileEntry[] {
  return Object.entries(
    profileMap
  )
    .filter(
      (
        entry
      ): entry is [
        string,
        RuntimeRecommendationQualityProfile,
      ] => {
        const [
          fingerprint,
          profile,
        ] = entry;

        return (
          normalizeRequiredText(
            fingerprint
          ) !== null &&
          profile !== null &&
          typeof profile ===
            "object"
        );
      }
    )
    .map(
      ([
        fingerprint,
        profile,
      ]) => ({
        fingerprint:
          normalizeRequiredText(
            profile.identity
              .fingerprint
          ) ??
          normalizeRequiredText(
            fingerprint
          ) ??
          fingerprint,

        profile,
      })
    )
    .sort(
      (
        left,
        right
      ) =>
        left.fingerprint.localeCompare(
          right.fingerprint
        )
    );
}

/* ------------------------------------------------------------------ */
/* Lookup Key Builder */
/* ------------------------------------------------------------------ */

type CreateAttemptedLookupKeysParams = {
  explicitFingerprint:
    string | null;

  candidateId:
    string;
};

function createAttemptedLookupKeys({
  explicitFingerprint,
  candidateId,
}: CreateAttemptedLookupKeysParams):
  string[] {
  const keys =
    new Set<string>();

  if (
    explicitFingerprint !== null
  ) {
    keys.add(
      explicitFingerprint
    );
  }

  keys.add(
    candidateId
  );

  return Array.from(
    keys
  );
}

/* ------------------------------------------------------------------ */
/* Text Helpers */
/* ------------------------------------------------------------------ */

function normalizeRequiredText(
  value:
    string | null | undefined
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value
      .trim()
      .replace(
        /\s+/g,
        " "
      );

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizeComparableText(
  value:
    string | null | undefined
): string {
  return (
    normalizeRequiredText(
      value
    ) ??
    ""
  ).toLowerCase();
}