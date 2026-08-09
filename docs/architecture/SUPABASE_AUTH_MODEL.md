# SUPABASE_AUTH_MODEL.md

# InnerMirror Supabase Authentication Model

> **Authentication establishes identity.**
>
> **The database establishes ownership.**

This document defines the authentication and profile-provisioning architecture
for the InnerMirror MVP.

It explains how GitHub OAuth, Supabase Auth, `auth.users`,
`public.profiles`, database triggers, and Row Level Security work together.

This document is derived from:

```text
LEGAL_FOUNDATION.md

↓

DATA_OWNERSHIP.md

↓

PERSONAL_DATA_INVENTORY.md

↓

PERSISTENCE_DOMAIN_MODEL.md

↓

DATABASE_SCHEMA.md

↓

SUPABASE_AUTH_MODEL.md

↓

RLS_SECURITY_MODEL.md

↓

SUPABASE_MIGRATION_PLAN.md
```

---

# 1. Purpose

InnerMirror needs a stable internal ownership boundary for long-term:

- Projects
- Reflection
- Project Events
- Learning Continuity
- Policy Records

GitHub provides authentication.

Supabase Auth establishes the authenticated InnerMirror identity.

The InnerMirror database uses that identity to enforce ownership.

---

# 2. Authentication Architecture

The current MVP authentication flow is:

```text
Learner

↓

GitHub OAuth

↓

Supabase Auth

↓

auth.users

↓

Database Trigger

↓

public.profiles

↓

InnerMirror Ownership Boundary
```

GitHub does not directly determine database ownership.

Supabase Auth does.

---

# 3. Authentication Provider

The current MVP uses:

```text
GitHub OAuth
```

through:

```text
Supabase Auth
```

The learner does not create a separate InnerMirror password.

InnerMirror must never request or store the learner's GitHub password.

---

# 4. Authentication Source of Truth

The authentication source of truth is:

```text
auth.users
```

The authoritative InnerMirror user identifier is:

```text
auth.users.id
```

This identifier is generated and managed by Supabase Auth.

Application code must not create its own competing authentication identifier.

---

# 5. Primary InnerMirror Identity

The primary ownership identifier is:

```text
Supabase Auth User UUID
```

Conceptually:

```text
auth.users.id

=

profiles.user_id

=

projects.user_id

=

reflections.user_id

=

project_events.user_id

=

policy_acceptances.user_id
```

This forms one continuous ownership boundary.

---

# 6. GitHub Identity

GitHub authentication establishes access to Supabase Auth.

GitHub identifiers may exist inside authentication provider metadata.

However, the current MVP does not use:

```text
GitHub email
```

or:

```text
GitHub username
```

as the authoritative InnerMirror ownership identifier.

They may change independently of the InnerMirror database ownership boundary.

---

# 7. Email Policy

GitHub email is not required as a persistent InnerMirror application field for
the current MVP.

The application database should not duplicate GitHub email merely for user
identification.

If Supabase Auth internally receives provider email as part of authentication,
that does not automatically justify copying it into:

```text
public.profiles
```

or other InnerMirror application tables.

Any future persistent email use requires a separately defined service purpose.

---

# 8. Identity Continuity

InnerMirror continuity follows the authenticated identity.

```text
Same authenticated identity

↓

Same Supabase Auth user

↓

Same InnerMirror continuity
```

If the learner authenticates in a way that results in a different supported
authentication identity:

```text
Different authenticated identity

↓

Different InnerMirror user
```

The current MVP does not automatically merge these identities.

---

# 9. No Hidden Identity Reconstruction

InnerMirror must not infer that two different authentication identities belong
to the same human through:

- name similarity,
- email similarity,
- repository similarity,
- Reflection similarity,
- writing style,
- behavior,
- project similarity,
- or Runtime inference.

Identity continuity remains under learner control.

---

# 10. Public Profile Purpose

`public.profiles` is not an authentication database.

Authentication remains in:

```text
auth.users
```

The purpose of:

```text
public.profiles
```

is to establish the application-level ownership root required by InnerMirror.

The initial profile contains only:

```text
user_id

account_status

last_activity_at

created_at

updated_at
```

---

# 11. Minimal Profile Principle

The MVP profile intentionally excludes:

```text
GitHub email

GitHub username

real name

phone number

postal address

date of birth

OAuth token

GitHub password
```

unless a future documented service requirement justifies a field.

The profile exists for continuity, not personal profiling.

---

# 12. Profile Creation Strategy

The approved MVP strategy is:

```text
METHOD B

Database-managed profile creation
```

The Landing does not create a profile directly after login.

Instead:

```text
GitHub OAuth Success

↓

Supabase creates auth.users row

↓

PostgreSQL trigger executes

↓

public.profiles row created
```

---

# 13. Why Database-Managed Provisioning

Database-managed provisioning is preferred because it provides one consistent
profile creation path.

It avoids:

```text
Browser

↓

Did profile insert happen?
```

becoming an ownership dependency.

Benefits include:

- no client-side profile provisioning race,
- consistent behavior across clients,
- smaller Landing responsibility,
- fewer client INSERT privileges,
- predictable ownership creation,
- easier future support for additional frontends.

---

# 14. Landing Responsibility

The Landing is responsible for:

```text
Start OAuth

↓

Receive authenticated Supabase session

↓

Use authenticated user
```

The Landing is **not** responsible for:

```text
creating user ownership records
```

through manual client-side profile provisioning.

---

# 15. Database Responsibility

The database is responsible for:

```text
auth.users created

↓

create matching public.profiles record
```

The relationship must be:

```text
profiles.user_id

references

auth.users.id
```

with:

```text
ON DELETE CASCADE
```

---

# 16. Profile Provisioning Trigger

The planned trigger architecture is:

```text
auth.users

AFTER INSERT

↓

handle_new_inner_mirror_user()

↓

INSERT public.profiles
```

Conceptually:

```sql
insert into public.profiles (
  user_id
)
values (
  new.id
);
```

Default values supply:

```text
account_status = active

last_activity_at = now()

created_at = now()

updated_at = now()
```

The final SQL belongs to the implementation migration.

---

# 17. Trigger Security

The profile trigger executes inside the database.

Because the trigger interacts with:

```text
auth.users
```

and:

```text
public.profiles
```

its function security configuration must be explicitly reviewed.

The implementation must not rely on unsafe or ambiguous privilege behavior.

The trigger function should remain:

- minimal,
- deterministic,
- limited to profile creation,
- free of unrelated application logic.

---

# 18. Trigger Failure Principle

Authentication availability is critical.

A broken profile trigger may interfere with new-user creation.

Therefore the trigger must be:

```text
small

↓

tested

↓

version-controlled

↓

verified before production use
```

Complex business logic must not be placed inside the authentication trigger.

---

# 19. Trigger Scope

The trigger may create:

```text
profiles
```

only.

It should not automatically create:

```text
projects

reflections

project_events

GitHub snapshots

Runtime intelligence

learning journeys
```

Authentication should create identity—not speculative application data.

---

# 20. Existing Auth Users

If an authenticated user already exists before the provisioning trigger is
introduced, the trigger will not automatically run retroactively.

Therefore implementation must verify whether existing production
`auth.users` records exist.

If necessary, an explicit one-time backfill must be reviewed.

For the new InnerMirror production project, the preferred starting state is:

```text
auth.users
EMPTY

profiles
EMPTY
```

before the first production authentication test.

---

# 21. RLS Relationship

Profile creation and profile access are different responsibilities.

```text
Trigger

↓

Creates profile


RLS

↓

Controls profile access
```

Creating profiles automatically does not replace RLS.

---

# 22. Initial RLS Model

For:

```text
public.profiles
```

the fundamental policy is:

```text
auth.uid()

=

profiles.user_id
```

A learner may access only their own profile.

---

# 23. SELECT Policy

Authenticated learners may read their own profile.

Conceptual rule:

```text
profiles.user_id = auth.uid()
```

Expected behavior:

```text
User A

↓

User A profile

ALLOW
```

```text
User A

↓

User B profile

DENY
```

---

# 24. UPDATE Policy

Authenticated learners may update only fields that product policy permits on
their own profile.

The ownership condition remains:

```text
profiles.user_id = auth.uid()
```

However, allowing row ownership does not automatically mean every column
should be client-editable.

Fields such as:

```text
account_status
```

may eventually require server-controlled updates.

Column-level authority must be reviewed separately where necessary.

---

# 25. INSERT Policy

Under the database-managed provisioning model, normal Landing code does not
need to create the profile.

Therefore a general client:

```text
INSERT profiles
```

policy is not required merely for profile creation.

Profile creation belongs to the database trigger.

This reduces client-side authority.

---

# 26. DELETE Policy

The current MVP does not expose arbitrary direct profile deletion as a normal
table operation.

Complete InnerMirror deletion is a coordinated service action.

Conceptually:

```text
Delete My InnerMirror Data

↓

Controlled account-deletion workflow

↓

Delete authenticated identity / owned records

↓

Cascade
```

A generic client-side `DELETE profiles` policy should therefore not be added
without the account-deletion architecture.

---

# 27. Anonymous Users

Anonymous unauthenticated access must not expose profile records.

Conceptually:

```text
Anonymous

↓

profiles

↓

DENY
```

---

# 28. Service Role

Supabase service-role credentials bypass normal RLS protections.

Therefore:

```text
SERVICE ROLE

SERVER ONLY
```

The service-role secret must never appear in:

```text
VITE_*
```

variables.

It must never be shipped in the browser bundle.

---

# 29. Browser Credential Boundary

The Landing may use only credentials intended for client-side Supabase access,
together with the authenticated Supabase session.

The browser must not contain:

- database password,
- service-role key,
- Runtime secrets,
- server credentials.

---

# 30. Authentication vs Authorization

These concepts must remain separate.

```text
Authentication

Who are you?

↓

Supabase Auth
```

```text
Authorization

Which records may you access?

↓

PostgreSQL RLS
```

A successful GitHub login does not grant unrestricted database access.

---

# 31. GitHub Authorization vs InnerMirror Authorization

GitHub OAuth authorization concerns access to GitHub-connected functionality.

InnerMirror database authorization concerns access to InnerMirror-owned
records.

They are separate boundaries.

```text
GitHub Authorization

≠

Database Authorization
```

---

# 32. Provider Token Boundary

GitHub provider tokens are security credentials.

They do not belong in:

```text
profiles

projects

reflections

project_events

policy_acceptances
```

Provider token handling must remain within the authentication / Runtime
security boundary.

---

# 33. Account Status

`profiles.account_status` may initially contain:

```text
active

inactive

deletion_pending
```

This field does not replace Supabase Auth state.

It represents InnerMirror application state.

Future implementation must define which system is allowed to modify this
field.

The browser should not automatically receive authority to change sensitive
account lifecycle state.

---

# 34. Last Activity

`last_activity_at` supports the current retention policy:

```text
3 years of inactivity
```

Authentication alone should not automatically define every possible form of
activity.

Before retention automation is implemented, InnerMirror must define which
events update:

```text
last_activity_at
```

Potential events include:

- authenticated service use,
- Reflection creation,
- project update,
- explicit analysis request.

---

# 35. User Creation Lifecycle

The intended lifecycle is:

```text
1. Learner selects GitHub login

2. GitHub OAuth completes

3. Supabase authenticates provider identity

4. auth.users row is created

5. Database trigger creates public.profiles

6. Supabase session becomes available to Landing

7. Landing requests learner-owned resources

8. RLS verifies auth.uid()

9. Learner sees only their own InnerMirror records
```

---

# 36. Returning User Lifecycle

For an existing authenticated identity:

```text
GitHub OAuth

↓

Existing auth.users

↓

Existing public.profiles

↓

Existing InnerMirror continuity
```

A new profile must not be created on every login.

The profile is one-to-one with:

```text
auth.users.id
```

---

# 37. Authentication Identity Changes

The current MVP does not promise cross-account identity migration.

If a provider authentication identity changes in a way that Supabase treats as
a new Auth user, InnerMirror may treat it as a new InnerMirror identity.

The service must not silently infer the previous identity.

A formal identity migration feature, if introduced later, requires separate
security and ownership design.

---

# 38. One-to-One Profile Invariant

The system must maintain:

```text
One auth.users row

=

Zero or One profile during provisioning

=

Exactly One profile after successful provisioning
```

Under normal production operation, every supported InnerMirror Auth user
should have exactly one matching profile.

Because:

```text
profiles.user_id
```

is the primary key, duplicate profiles for one Auth user are structurally
prevented.

---

# 39. Deletion Relationship

Current schema:

```text
profiles.user_id

references auth.users(id)

on delete cascade
```

Therefore deleting the corresponding Auth user is intended to remove the
profile automatically.

Future child tables then follow the InnerMirror deletion hierarchy.

The complete cascade behavior must be tested before account deletion is
declared production-ready.

---

# 40. GitHub Deletion Boundary

Deleting the InnerMirror Auth identity must never cause deletion of:

- GitHub account,
- GitHub repositories,
- GitHub branches,
- GitHub commits,
- GitHub pull requests.

InnerMirror deletion stops at InnerMirror-controlled information.

---

# 41. Authentication Logging

Authentication logs must not become a secondary personal-profile database.

Logs should not unnecessarily duplicate:

- Reflection,
- project content,
- provider tokens,
- full OAuth responses.

Log purpose and retention require separate production review.

---

# 42. Minimum Age

The current service is intended for:

```text
users aged 14 or older
```

The current authentication model should not collect full date of birth merely
to establish this service policy.

If age eligibility confirmation is introduced, it should be handled through a
minimal separate policy mechanism.

---

# 43. Current Production Supabase Environment

Current production project:

```text
innermirror-production
```

Production database region:

```text
Northeast Asia (Seoul)
AWS ap-northeast-2
```

Current initial state:

```text
public.profiles
CREATED

profiles RLS
ENABLED

profiles ownership policies
NOT YET IMPLEMENTED

profile provisioning trigger
NOT YET IMPLEMENTED

production Auth user verification
NOT YET COMPLETED
```

---

# 44. Implementation Order

The next implementation sequence is:

```text
Step 1

profiles table
DONE

↓

Step 2

profiles RLS
DONE

↓

Step 3

profile provisioning function

↓

Step 4

auth.users insert trigger

↓

Step 5

self SELECT policy

↓

Step 6

appropriate UPDATE policy

↓

Step 7

connect Landing to production Supabase

↓

Step 8

GitHub OAuth test

↓

Step 9

verify auth.users

↓

Step 10

verify profiles auto-created

↓

Step 11

verify cross-user isolation
```

---

# 45. Verification Matrix

Before the authentication foundation is considered complete:

```text
GitHub OAuth succeeds
□

auth.users row exists
□

matching profiles row exists
□

profiles.user_id = auth.users.id
□

duplicate profile not created on re-login
□

anonymous profile SELECT denied
□

User A own profile SELECT allowed
□

User A User B profile SELECT denied
□

unauthorized profile INSERT denied
□

unauthorized lifecycle UPDATE denied
□

service-role key absent from browser
□
```

---

# 46. Failure Modes to Test

The implementation must consider:

```text
OAuth cancelled

OAuth provider error

profile trigger failure

duplicate provisioning attempt

expired authentication session

RLS denial

missing profile

deleted user

re-login after deletion
```

Authentication UX should fail safely rather than bypass ownership boundaries.

---

# 47. Architecture Boundary

Responsibilities remain:

```text
GitHub

↓

External identity provider


Supabase Auth

↓

Authenticated identity


Database Trigger

↓

Profile provisioning


PostgreSQL RLS

↓

Record authorization


Landing

↓

User experience


Runtime

↓

Authorized interpretation
```

No single layer should silently assume another layer's responsibility.

---

# 48. Future Authentication Providers

The architecture may eventually support additional authentication providers.

However, provider expansion must preserve:

```text
Supabase Auth ID

↓

InnerMirror ownership
```

The database must not become dependent on GitHub-specific identifiers as its
core ownership key.

---

# 49. Future Identity Linking

Automatic account linking is outside the current MVP.

Status:

```text
NOT SUPPORTED
```

Any future identity-linking feature must separately define:

- explicit user intent,
- authentication proof,
- conflict handling,
- ownership migration,
- deletion behavior,
- audit behavior,
- security review.

---

# 50. Governance Rule

Authentication changes require review whenever the service introduces:

- a new OAuth provider,
- account linking,
- email-based identity,
- password authentication,
- anonymous accounts,
- organization accounts,
- administrator impersonation,
- identity migration,
- external identity verification.

Authentication must not evolve implicitly through UI code alone.

---

# Production Authentication Foundation

GitHub proves access to a provider identity.

Supabase Auth establishes the InnerMirror identity.

`auth.users.id` defines the ownership root.

The database creates the application profile.

RLS protects the profile.

The Landing never creates ownership by itself.

Different identities are not silently merged.

Authentication establishes identity.

The database enforces ownership.