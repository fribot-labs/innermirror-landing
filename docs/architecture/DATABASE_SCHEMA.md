# DATABASE_SCHEMA.md

# InnerMirror MVP Database Schema

> **Purpose**
>
> This document defines the initial production database schema for the
> InnerMirror MVP.
>
> It translates the persistence model into concrete Supabase/PostgreSQL
> tables, keys, relationships, deletion rules, and Row Level Security
> boundaries.

This document is derived from:

```text
LEGAL_FOUNDATION.md

↓

PRIVACY.md

↓

DATA_OWNERSHIP.md

↓

PERSONAL_DATA_INVENTORY.md

↓

PERSISTENCE_DOMAIN_MODEL.md

↓

DATABASE_SCHEMA.md
```

The schema must remain consistent with those documents.

---

# 1. Design Goals

The initial database must support:

- authenticated user ownership,
- project continuity,
- Reflection persistence,
- project events,
- Fribot Learning template origin,
- policy acceptance records,
- three-year inactivity handling,
- complete InnerMirror account deletion,
- strict user-level isolation.

The initial database should **not** attempt to persist everything produced by Runtime or GitHub.

---

# 2. Core Schema Principle

The database follows this rule:

```text
Persist human continuity.

Retrieve GitHub evidence when needed.

Regenerate Runtime intelligence where possible.
```

The initial production database therefore focuses on:

```text
User

Project

Reflection

Project Event

Policy Acceptance
```

---

# 3. Initial Tables

The initial MVP schema contains five application tables.

```text
profiles

projects

reflections

project_events

policy_acceptances
```

Supabase Auth remains responsible for authentication identity.

Application tables must not duplicate authentication information unnecessarily.

---

# 4. Authentication Source of Truth

Supabase Auth provides:

```text
auth.users.id
```

This UUID is the primary ownership boundary for InnerMirror.

Conceptually:

```text
auth.users.id

↓

profiles.user_id

↓

projects.user_id

↓

reflections.user_id

↓

project_events.user_id

↓

policy_acceptances.user_id
```

All user-owned persistent records must remain traceable to this identifier.

---

# 5. profiles

## Purpose

`profiles` stores the minimum application-level state required for an InnerMirror user.

It does not replace `auth.users`.

---

## Proposed Structure

```text
profiles

user_id
github_provider_id
github_username
account_status
last_activity_at
created_at
updated_at
```

---

## Fields

### user_id

```text
Type
uuid

Primary Key
YES

Foreign Key
auth.users.id

Nullable
NO
```

This is the primary InnerMirror user identifier.

---

### github_provider_id

```text
Type
text

Nullable
YES
```

Used to associate the authenticated InnerMirror user with the GitHub provider identity where available.

This field must not be used to merge separate InnerMirror users automatically.

---

### github_username

```text
Type
text

Nullable
YES
```

Used only when required for GitHub-related UX or repository presentation.

GitHub username is not the ownership boundary.

---

### account_status

```text
Type
text

Default
active
```

Initial allowed values:

```text
active

inactive

deletion_pending
```

A future PostgreSQL enum may be introduced if useful.

For the MVP, a check constraint is sufficient.

---

### last_activity_at

```text
Type
timestamptz

Nullable
NO
```

Used to determine the three-year inactivity retention period.

The application must define what counts as meaningful service activity.

---

### created_at

```text
Type
timestamptz

Default
now()
```

---

### updated_at

```text
Type
timestamptz

Default
now()
```

---

# 6. What profiles Must Not Store

The MVP `profiles` table should not contain:

```text
GitHub email

real name

phone number

postal address

date of birth

GitHub password

OAuth access token
```

unless a future service requirement establishes a separate necessary purpose.

---

# 7. projects

## Purpose

`projects` represents a learner-owned project journey inside InnerMirror.

For the current Fribot Learning model:

```text
One Fribot Learning Project

=

One Export Repository

=

One InnerMirror Project
```

---

## Proposed Structure

```text
projects

id
user_id

name

repository_id
repository_owner
repository_name

template_id
course_id

current_focus
status

started_at
created_at
updated_at
```

---

# 8. projects.id

```text
Type
uuid

Primary Key
YES

Default
gen_random_uuid()
```

---

# 9. projects.user_id

```text
Type
uuid

Foreign Key
profiles.user_id

Nullable
NO
```

Recommended deletion behavior:

```text
ON DELETE CASCADE
```

Deleting the InnerMirror user therefore removes the user's projects.

---

# 10. projects.name

```text
Type
text

Nullable
NO
```

Represents the learner-facing project name.

---

# 11. Repository Identity

The minimum GitHub association may contain:

```text
repository_id

repository_owner

repository_name
```

---

## repository_id

```text
Type
text

Nullable
YES
```

The GitHub repository identifier should be preferred as the stable external repository identity when available.

---

## repository_owner

```text
Type
text

Nullable
YES
```

---

## repository_name

```text
Type
text

Nullable
YES
```

These fields are not intended to duplicate the entire GitHub repository.

---

# 12. Repository Uniqueness

The MVP should not assume that repository name alone uniquely identifies a project.

Where possible:

```text
repository_id
```

should be used for external uniqueness.

A user should not accidentally create duplicate active InnerMirror projects for the same repository without explicit product intent.

The exact uniqueness constraint may be introduced after actual UX behavior is confirmed.

---

# 13. Fribot Learning Origin

### template_id

```text
Type
text

Nullable
YES
```

Example:

```text
fribot-learning-template-v1
```

This identifies the original structured template where applicable.

---

### course_id

```text
Type
text

Nullable
YES
```

Used only where Fribot Learning supplies a meaningful course identifier.

---

# 14. current_focus

```text
Type
text

Nullable
YES
```

Represents the learner's currently declared project focus.

Runtime must not silently overwrite this learner-controlled value.

---

# 15. Project status

```text
Type
text

Default
active
```

Initial allowed values:

```text
active

paused

completed
```

Recommended check constraint:

```text
status IN ('active', 'paused', 'completed')
```

---

# 16. Project timestamps

### started_at

```text
Type
timestamptz

Nullable
YES
```

Represents the meaningful learner project start time.

---

### created_at

```text
Type
timestamptz

Default
now()
```

---

### updated_at

```text
Type
timestamptz

Default
now()
```

---

# 17. reflections

## Purpose

`reflections` stores learner-created Reflection records.

Reflection is one of the core persistent source records of InnerMirror.

---

## Proposed Structure

```text
reflections

id
user_id
project_id

content

reflection_kind

created_at
updated_at
```

---

# 18. reflections.id

```text
Type
uuid

Primary Key
YES

Default
gen_random_uuid()
```

---

# 19. reflections.user_id

```text
Type
uuid

Foreign Key
profiles.user_id

Nullable
NO

ON DELETE
CASCADE
```

This direct `user_id` relationship is intentionally retained even though the project already has a user.

It simplifies:

- ownership checks,
- deletion,
- RLS,
- auditing.

The application must ensure:

```text
reflection.user_id

=

project.user_id
```

for project-linked Reflections.

---

# 20. reflections.project_id

```text
Type
uuid

Foreign Key
projects.id

Nullable
YES
```

Why nullable?

InnerMirror may allow Reflection without a currently active project.

This supports direct InnerMirror entry independent of Fribot Learning.

Recommended deletion behavior:

```text
ON DELETE CASCADE
```

for project-bound Reflection should be considered carefully.

However, because the MVP deletion philosophy treats the entire user's history as one ownership domain, the simplest MVP behavior is:

```text
ON DELETE CASCADE
```

when a project is deleted internally.

User-facing partial project deletion is not exposed.

---

# 21. reflections.content

```text
Type
text

Nullable
NO
```

This stores the learner's Reflection text.

Because Reflection may contain highly personal information, duplication into unrelated tables must be avoided.

---

# 22. reflection_kind

```text
Type
text

Nullable
YES
```

Optional values may include:

```text
reflection

first_question

decision

unresolved_question
```

This allows the MVP to represent concepts such as `First Question` without immediately creating separate tables.

Do not add unnecessary types before actual product use requires them.

---

# 23. Reflection timestamps

### created_at

```text
Type
timestamptz

Default
now()
```

### updated_at

```text
Type
timestamptz

Default
now()
```

---

# 24. project_events

## Purpose

`project_events` stores meaningful project continuity events.

The table must not become a complete duplicate of GitHub activity.

---

## Proposed Structure

```text
project_events

id
user_id
project_id

event_type
event_context

created_at
```

---

# 25. project_events.id

```text
Type
uuid

Primary Key
YES

Default
gen_random_uuid()
```

---

# 26. project_events.user_id

```text
Type
uuid

Foreign Key
profiles.user_id

Nullable
NO

ON DELETE
CASCADE
```

---

# 27. project_events.project_id

```text
Type
uuid

Foreign Key
projects.id

Nullable
NO

ON DELETE
CASCADE
```

---

# 28. event_type

```text
Type
text

Nullable
NO
```

Initial event types may include:

```text
project_started

focus_changed

milestone_reached

pull_request_completed

project_paused

project_resumed

project_completed
```

Do not record every commit or repository operation as an InnerMirror project event.

Only events meaningful to continuity belong here.

---

# 29. event_context

Preferred initial type:

```text
jsonb
```

Reason:

Different event types may require different lightweight context without forcing premature schema expansion.

Examples:

```json
{
  "previousFocus": "Understand class syntax",
  "newFocus": "Understand object relationships"
}
```

or:

```json
{
  "pullRequestNumber": 4,
  "title": "Introduce robot class abstraction"
}
```

The field must not become a dumping ground for complete GitHub payloads.

---

# 30. policy_acceptances

## Purpose

Stores only governance records necessary to know which policies or consents applied to a learner.

---

## Proposed Structure

```text
policy_acceptances

id
user_id

policy_type
policy_version
acceptance_type

accepted_at
```

---

# 31. policy_acceptances.id

```text
Type
uuid

Primary Key
YES

Default
gen_random_uuid()
```

---

# 32. policy_acceptances.user_id

```text
Type
uuid

Foreign Key
profiles.user_id

Nullable
NO

ON DELETE
CASCADE
```

The implications of deleting policy evidence during complete account deletion must be reviewed before production.

If law requires a minimal audit record after account deletion, that record should live in a separate legal/audit domain and must not contain Reflection or project content.

---

# 33. policy_type

Examples:

```text
privacy

terms

age_eligibility

optional_consent
```

---

# 34. policy_version

```text
Type
text

Nullable
NO
```

Example:

```text
privacy-v1
```

---

# 35. acceptance_type

```text
Type
text

Nullable
NO
```

Possible values:

```text
acknowledged

consented
```

This distinction is important.

Not every policy notice is legally equivalent to consent.

---

# 36. accepted_at

```text
Type
timestamptz

Default
now()
```

---

# 37. Tables Not Created in Initial MVP

The following tables should **not** be created initially.

```text
learning_journeys

github_snapshots

runtime_summaries

runtime_recommendations

runtime_predictions

ai_profiles

user_emails
```

Their absence is intentional.

---

# 38. Why No learning_journeys Table

Learning Journey can initially be reconstructed from:

```text
Project

+

Reflection

+

Project Events

+

Time
```

Creating a separate `learning_journeys` table immediately would risk duplicating the same information.

---

# 39. Why No github_snapshots Table

GitHub Snapshot is external evidence.

Preferred lifecycle:

```text
Explicit Analysis Request

↓

Fetch Snapshot

↓

Analyze

↓

Discard or keep temporarily
```

Persistent GitHub Snapshot storage requires separate justification.

---

# 40. Why No Runtime Intelligence Tables

Current MVP default:

```text
Summary
TEMPORARY

Recommendation
TEMPORARY

Next Question
TEMPORARY

Prediction
TEMPORARY
```

Runtime intelligence should be regenerated wherever practical.

---

# 41. Relationship Diagram

Conceptual relationship:

```text
auth.users
    │
    │ 1
    ▼
profiles
    │
    ├───────────────┐
    │               │
    │ 1             │ 1
    ▼               ▼
projects       policy_acceptances
    │
    ├───────────────┐
    │               │
    │ 1             │ 1
    ▼               ▼
reflections     project_events
```

Every user-owned record remains anchored to:

```text
auth.users.id
```

---

# 42. Deletion Model

The intended complete deletion path is:

```text
auth user

↓

profiles

↓

projects

↓

reflections

↓

project_events

↓

policy_acceptances

↓

persistent derived records, if any

↓

deleted
```

GitHub remains outside this cascade.

---

# 43. Foreign Key Cascade Strategy

Recommended initial strategy:

```text
auth.users
    ↓ CASCADE
profiles

profiles
    ↓ CASCADE
projects

profiles
    ↓ CASCADE
reflections

profiles
    ↓ CASCADE
project_events

profiles
    ↓ CASCADE
policy_acceptances

projects
    ↓ CASCADE
reflections

projects
    ↓ CASCADE
project_events
```

Exact Supabase Auth deletion behavior must be tested before production.

Account deletion must not rely on unverified assumptions about Auth cascade behavior.

---

# 44. Row Level Security

RLS is mandatory for all applicable user-owned public schema tables.

Target tables:

```text
profiles

projects

reflections

project_events

policy_acceptances
```

Conceptual rule:

```text
auth.uid()

=

record.user_id
```

---

# 45. profiles RLS

Conceptual SELECT rule:

```text
user_id = auth.uid()
```

Conceptual UPDATE rule:

```text
user_id = auth.uid()
```

Users must not read or update other users' profiles.

---

# 46. projects RLS

Conceptual policy:

```text
projects.user_id = auth.uid()
```

Applied to:

```text
SELECT

INSERT

UPDATE

DELETE
```

User-facing DELETE may not be exposed even if database-level ownership permits internal deletion.

---

# 47. reflections RLS

Conceptual policy:

```text
reflections.user_id = auth.uid()
```

Applied to all user-level operations.

---

# 48. project_events RLS

Conceptual policy:

```text
project_events.user_id = auth.uid()
```

---

# 49. policy_acceptances RLS

Users may be allowed to read their own policy history.

Insert behavior may be handled either:

- through authenticated client insertion with strict RLS,
- or through trusted server-side logic.

The final implementation should minimize client authority where practical.

---

# 50. Cross-User Protection

The database must never rely solely on UI filtering.

For example:

```text
WHERE user_id = currentUser
```

in React code is not a sufficient security boundary.

The database itself must reject unauthorized cross-user access.

---

# 51. user_id Consistency

For child records associated with a project:

```text
reflection.user_id

must equal

project.user_id
```

and:

```text
project_event.user_id

must equal

project.user_id
```

This can be enforced through:

- trusted application logic,
- database triggers,
- composite foreign keys,
- or controlled server-side writes.

The exact mechanism should be selected during implementation.

---

# 52. Indexes

Recommended indexes:

```text
projects(user_id)

projects(repository_id)

reflections(user_id)

reflections(project_id)

reflections(created_at)

project_events(user_id)

project_events(project_id)

project_events(created_at)

policy_acceptances(user_id)

profiles(last_activity_at)
```

These support common ownership, timeline, and retention queries.

---

# 53. Inactivity Retention Query

The service must eventually be able to identify:

```text
last_activity_at

<

current_time - 3 years
```

The exact cleanup job is not part of the initial schema.

However, the schema must support it.

---

# 54. Activity Update Rule

`last_activity_at` should not update for every passive page load unless product policy defines that as meaningful activity.

Recommended meaningful activity candidates:

```text
successful authenticated service use

Reflection creation

project analysis request

project update
```

The exact rule must be documented before retention automation is enabled.

---

# 55. Timestamp Standard

All persisted timestamps should use:

```text
timestamptz
```

and be stored consistently in UTC at the database layer.

UI may display localized time.

---

# 56. Identifier Standard

Application-owned records should use:

```text
uuid
```

with:

```text
gen_random_uuid()
```

where appropriate.

External identifiers such as GitHub repository IDs may remain text or bigint depending on API requirements.

Do not force external identifiers into application UUID formats.

---

# 57. GitHub Email

No application table should include:

```text
github_email
```

in the current MVP schema.

If Supabase Auth internally receives provider email as part of authentication,
the application should not duplicate it into its own persistence schema unless a future necessary purpose is defined.

---

# 58. OAuth Tokens

OAuth access tokens must not be stored in:

```text
profiles

projects

reflections

project_events

policy_acceptances
```

Credential handling belongs to the authentication/security architecture.

---

# 59. Reflection Privacy

Reflection content should not be duplicated into:

- logs,
- analytics events,
- project events,
- derived records,

unless explicitly necessary.

Prefer references by `reflection_id`.

---

# 60. Logging Boundary

Production application logs must remain separate from user continuity storage.

Logs should not become an accidental secondary Reflection database.

Log design requires:

```text
purpose

retention

access control

redaction
```

---

# 61. Backup Boundary

Database deletion and backup retention must be treated separately.

Future production design must document:

```text
Supabase backups

point-in-time recovery

deleted-user data in backups

backup retention
```

Status:

```text
OPEN
```

---

# 62. Production Supabase Project

The production schema should be created in a clean Supabase project or otherwise in a verified clean production environment.

Legacy experimental tables should not constrain the production architecture.

Current experimental data may be deleted before production initialization.

---

# 63. Production Region

Production Supabase region remains:

```text
OPEN
```

Region must be selected before real long-term learner data is introduced.

---

# 64. Migration Principle

All production schema changes should eventually be represented by version-controlled migrations.

Preferred direction:

```text
supabase/

migrations/
```

Manual Dashboard-only changes should be minimized once production schema work begins.

---

# 65. Initial Migration Order

Recommended implementation order:

```text
Migration 1

profiles


Migration 2

projects


Migration 3

reflections


Migration 4

project_events


Migration 5

policy_acceptances


Migration 6

indexes / constraints


Migration 7

RLS


Migration 8

RLS policies
```

For the first implementation, related changes may be grouped if carefully reviewed.

---

# 66. Schema Evolution Principle

New fields must not be added because they are merely convenient.

Before adding a field, confirm:

```text
Purpose

Source

Ownership

Retention

Deletion

Access

Security

Need for persistence
```

---

# 67. Schema Summary

Initial MVP:

```text
auth.users
    ↓

profiles
    ↓
    ├── projects
    │      ├── reflections
    │      └── project_events
    │
    └── policy_acceptances
```

External GitHub evidence:

```text
NOT persistently duplicated by default
```

Runtime-derived intelligence:

```text
NOT persistently stored by default
```

---

# 68. Production Gate

The schema must not be considered production-ready until all of the following are verified:

```text
□ Production Supabase project selected

□ Production region confirmed

□ Legacy test data removed or isolated

□ Tables created through reviewed migration

□ Foreign keys verified

□ Cascade deletion tested

□ RLS enabled

□ SELECT policies tested

□ INSERT policies tested

□ UPDATE policies tested

□ DELETE policies tested

□ Cross-user access test passed

□ Reflection ownership test passed

□ GitHub email not duplicated

□ OAuth tokens not stored in application tables

□ SSL / encrypted database transport reviewed

□ Backup behavior reviewed

□ Account deletion tested

□ 3-year inactivity design reviewed

□ Privacy documentation matches actual schema
```

---

# 69. Relationship to Future Documents

After this document:

```text
DATABASE_SCHEMA.md

↓

SUPABASE_MIGRATION_PLAN.md

↓

RLS_SECURITY_MODEL.md

↓

ACCOUNT_DELETION_IMPLEMENTATION.md

↓

PERSISTENCE_IMPLEMENTATION
```

The implementation must follow this schema rather than allowing code to define the database architecture implicitly.

---

# Foundation Rule

A database table exists only when continuity requires it.

A database field exists only when its purpose is understood.

Every learner record belongs to one authenticated ownership boundary.

GitHub remains external.

Reflection remains learner-owned.

Runtime intelligence remains derived.

RLS is not optional.

Complete deletion must be possible.

Persistence must remain smaller than the information available to the system.