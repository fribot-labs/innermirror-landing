# SUPABASE_MIGRATION_PLAN.md

# InnerMirror Supabase Migration Plan

> **Purpose**
>
> This document defines the implementation order of the InnerMirror production
> Supabase database.
>
> It translates the approved architecture into an executable migration plan.
>
> The purpose is to ensure that production database implementation follows the
> approved legal, ownership, persistence, and security architecture.

---

# 1. Migration Philosophy

The production database must **never** be created by improvisation.

Implementation follows this document.

Architecture must always exist before implementation.

The migration sequence follows:

```text
LEGAL

↓

OWNERSHIP

↓

PERSISTENCE

↓

DATABASE

↓

RLS

↓

IMPLEMENTATION
```

---

# 2. Initial State

Current MVP

```text
Supabase Authentication

↓

Implemented
```

Current MVP

```text
Application Database

↓

Not Yet Implemented
```

Existing experimental tables and test records may be removed before production
implementation begins.

The production database starts from a clean architectural foundation.

---

# 3. Migration Sequence

The recommended implementation order is:

```text
Migration-001

profiles

↓

Migration-002

projects

↓

Migration-003

reflections

↓

Migration-004

project_events

↓

Migration-005

policy_acceptances

↓

Migration-006

Indexes

↓

Migration-007

Row Level Security

↓

Migration-008

Verification
```

Each migration should be completed and verified before proceeding.

---

# Migration-001

## profiles

Purpose

Create the learner ownership boundary.

Table

```text
profiles
```

Fields

```text
user_id

github_provider_id

github_username

account_status

last_activity_at

created_at

updated_at
```

Verification

```text
✓ Table created

✓ Foreign key

✓ UUID ownership
```

---

# Migration-002

## projects

Purpose

Create learner-owned project continuity.

Table

```text
projects
```

Fields

```text
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

Verification

```text
✓ Foreign key

✓ Cascade

✓ Project ownership
```

---

# Migration-003

## reflections

Purpose

Persist learner-created Reflection.

Table

```text
reflections
```

Fields

```text
id

user_id

project_id

content

reflection_kind

created_at

updated_at
```

Verification

```text
✓ Reflection persistence

✓ User ownership

✓ Project linkage
```

---

# Migration-004

## project_events

Purpose

Store meaningful project continuity.

Table

```text
project_events
```

Fields

```text
id

user_id

project_id

event_type

event_context

created_at
```

Verification

```text
✓ Event persistence

✓ Ownership

✓ Project relationship
```

---

# Migration-005

## policy_acceptances

Purpose

Record policy acknowledgement and legal consent.

Table

```text
policy_acceptances
```

Fields

```text
id

user_id

policy_type

policy_version

acceptance_type

accepted_at
```

Verification

```text
✓ Policy persistence

✓ User relationship
```

---

# Migration-006

## Indexes

Purpose

Optimize ownership and timeline queries.

Recommended indexes

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

Verification

```text
✓ Indexes created

✓ Query plans verified
```

---

# Migration-007

## Row Level Security

Purpose

Protect learner ownership.

Target tables

```text
profiles

projects

reflections

project_events

policy_acceptances
```

Policies

```text
SELECT

INSERT

UPDATE

DELETE
```

Verification

```text
✓ User A

Cannot access

User B
```

---

# Migration-008

## Production Verification

Verify

```text
Authentication

↓

Profiles

↓

Projects

↓

Reflections

↓

Events

↓

Policies

↓

RLS

↓

Deletion

↓

Retention
```

Checklist

```text
□ Authentication

□ Ownership

□ Cascade deletion

□ Reflection persistence

□ Project persistence

□ Policy persistence

□ RLS

□ Cross-user isolation

□ Account deletion

□ Inactivity handling
```

---

# Future Migrations

The following domains are intentionally excluded from the initial MVP.

```text
Learning Journey

GitHub Snapshot

Runtime Summary

Recommendation

Prediction

AI Profile
```

These migrations should be introduced only after a demonstrated product need.

---

# Migration Rule

Every migration must answer:

```text
Why is this table needed?

Who owns it?

How is ownership enforced?

How is deletion handled?

How long is it retained?
```

If these questions cannot be answered,

the migration should not be implemented.

---

# Rollback Rule

Every migration must support rollback.

Rollback verification includes:

```text
Schema

↓

Constraints

↓

Indexes

↓

Policies
```

Rollback should never leave the database in an inconsistent ownership state.

---

# Production Gate

The production database is ready only after:

```text
□ All migrations complete

□ All verification passed

□ RLS enabled

□ Cross-user isolation verified

□ Account deletion verified

□ Privacy Policy matches implementation

□ Data Ownership matches implementation

□ Legal Foundation remains unchanged
```

---

# Foundation Statement

Migration follows architecture.

Architecture follows ownership.

Ownership follows the learner.

The database exists to preserve learner continuity.

No migration should weaken ownership,
privacy,
or legal compliance.