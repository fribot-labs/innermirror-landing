import {
    supabaseClient,
} from "./supabaseClient";


export type PolicyType =
  | "privacy"
  | "terms";


export type PolicyAcceptanceRecord = {
  id:
    string;

  userId:
    string;

  policyType:
    PolicyType;

  policyVersion:
    string;

  acceptedAt:
    string;

  createdAt:
    string;
};


export type CreatePolicyAcceptanceInput = {
  policyType:
    PolicyType;

  policyVersion:
    string;

  acceptedAt?:
    string;
};


type PolicyAcceptanceRow = {
  id:
    string;

  user_id:
    string;

  policy_type:
    string;

  policy_version:
    string;

  accepted_at:
    string;

  created_at:
    string;
};


type PolicyAcceptanceInsertPayload = {
  user_id:
    string;

  policy_type:
    PolicyType;

  policy_version:
    string;

  accepted_at?:
    string;
};


export const CURRENT_PRIVACY_POLICY = {
  type:
    "privacy",

  version:
    "2026-08-v1",
} as const;


const POLICY_ACCEPTANCE_SELECT = `
  id,
  user_id,
  policy_type,
  policy_version,
  accepted_at,
  created_at
`;


export async function listPolicyAcceptances():
  Promise<PolicyAcceptanceRecord[]> {
  const userId =
    await requireAuthenticatedUserId();

  const {
    data,
    error,
  } =
    await supabaseClient
      .from(
        "policy_acceptances"
      )
      .select(
        POLICY_ACCEPTANCE_SELECT
      )
      .eq(
        "user_id",
        userId
      )
      .order(
        "accepted_at",
        {
          ascending:
            false,
        }
      );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ).map(
    (row) =>
      toPolicyAcceptanceRecord(
        row as PolicyAcceptanceRow
      )
  );
}


export async function hasPolicyAcceptance({
  policyType,
  policyVersion,
}: {
  policyType:
    PolicyType;

  policyVersion:
    string;
}): Promise<boolean> {
  const normalizedPolicyVersion =
    normalizeRequiredValue(
      policyVersion,
      "A policy version is required to check Policy Acceptance."
    );

  const userId =
    await requireAuthenticatedUserId();

  const {
    data,
    error,
  } =
    await supabaseClient
      .from(
        "policy_acceptances"
      )
      .select(
        "id"
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "policy_type",
        policyType
      )
      .eq(
        "policy_version",
        normalizedPolicyVersion
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data !==
    null;
}


export async function hasAcceptedCurrentPrivacyPolicy():
  Promise<boolean> {
  return hasPolicyAcceptance({
    policyType:
      CURRENT_PRIVACY_POLICY.type,

    policyVersion:
      CURRENT_PRIVACY_POLICY.version,
  });
}


export async function createPolicyAcceptance(
  input:
    CreatePolicyAcceptanceInput
): Promise<PolicyAcceptanceRecord> {
  const normalizedPolicyVersion =
    normalizeRequiredValue(
      input.policyVersion,
      "A policy version is required to create Policy Acceptance."
    );

  const userId =
    await requireAuthenticatedUserId();

  const insertPayload:
    PolicyAcceptanceInsertPayload = {
    user_id:
      userId,

    policy_type:
      input.policyType,

    policy_version:
      normalizedPolicyVersion,
  };

  if (
    input.acceptedAt !==
    undefined
  ) {
    insertPayload.accepted_at =
      normalizeTimestamp(
        input.acceptedAt,
        "Policy Acceptance requires a valid acceptedAt value."
      );
  }

  const {
    data,
    error,
  } =
    await supabaseClient
      .from(
        "policy_acceptances"
      )
      .insert(
        insertPayload
      )
      .select(
        POLICY_ACCEPTANCE_SELECT
      )
      .single();

  if (error) {
    throw error;
  }

  return toPolicyAcceptanceRecord(
    data as PolicyAcceptanceRow
  );
}


export async function acceptCurrentPrivacyPolicy():
  Promise<PolicyAcceptanceRecord> {
  return createPolicyAcceptance({
    policyType:
      CURRENT_PRIVACY_POLICY.type,

    policyVersion:
      CURRENT_PRIVACY_POLICY.version,
  });
}


function toPolicyAcceptanceRecord(
  row:
    PolicyAcceptanceRow
): PolicyAcceptanceRecord {
  return {
    id:
      row.id,

    userId:
      row.user_id,

    policyType:
      row.policy_type as PolicyType,

    policyVersion:
      row.policy_version,

    acceptedAt:
      row.accepted_at,

    createdAt:
      row.created_at,
  };
}


async function requireAuthenticatedUserId():
  Promise<string> {
  const {
    data:
      authData,

    error:
      authError,
  } =
    await supabaseClient.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (
    !authData.user
  ) {
    throw new Error(
      "An authenticated user is required to access Policy Acceptances."
    );
  }

  return authData.user.id;
}


function normalizeRequiredValue(
  value:
    string,
  errorMessage:
    string
): string {
  const normalizedValue =
    value.trim();

  if (
    normalizedValue.length ===
    0
  ) {
    throw new Error(
      errorMessage
    );
  }

  return normalizedValue;
}


function normalizeTimestamp(
  value:
    string,
  errorMessage:
    string
): string {
  const timestamp =
    new Date(
      value
    );

  if (
    Number.isNaN(
      timestamp.getTime()
    )
  ) {
    throw new Error(
      errorMessage
    );
  }

  return timestamp.toISOString();
}