# PERSISTENCE_DOMAIN_MODEL.md

# InnerMirror Persistence Domain Model

> **Persistence exists to preserve learner continuity, not to collect everything available.**

This document defines the persistence domains of the InnerMirror MVP.

It translates the legal and data-ownership principles defined in:

```text
LEGAL_FOUNDATION.md

PRIVACY.md

DATA_OWNERSHIP.md

PERSONAL_DATA_INVENTORY.md
```

into a system-level persistence model.

This document does **not** define the final database schema.

It defines what categories of information may become persistent service state and how those categories relate to one another.

---

# 1. Purpose

InnerMirror is an online Reflection and Project Continuity service.

Long-term continuity requires some learner information to survive:

- browser refresh,
- logout and login,
- different sessions,
- project progression,
- and long periods between Reflection events.

Persistence therefore exists to support continuity.

It does not exist to duplicate every piece of information available from GitHub or other external systems.

---

# 2. Persistence Principle

The fundamental rule is:

```text
Human-created continuity

↓

Prefer persistence


Externally reproducible evidence

↓

Prefer retrieval


Runtime-derived interpretation

↓

Persist only when necessary
```

InnerMirror should permanently store the minimum information necessary to reconstruct the learner's meaningful continuity.

---

# 3. Persistence Boundary

The system is divided into three broad information classes.

```text
SOURCE RECORDS

Learner-created or learner-owned continuity

↓

PERSIST


EXTERNAL EVIDENCE

Information available again from GitHub

↓

RETRIEVE WHEN NEEDED


DERIVED INTELLIGENCE

Runtime-generated interpretation

↓

REGENERATE WHERE POSSIBLE
```

---

# 4. Primary Ownership Boundary

Every persistent learner record must belong to one authenticated InnerMirror identity.

Conceptually:

```text
Authenticated User

↓

user_id

↓

All InnerMirror persistent records
```

The primary persistence ownership boundary is:

```text
Supabase Auth User ID
```

A GitHub provider identity may be associated with this user.

GitHub email is not required as the primary persistent user identifier for the current MVP.

---

# 5. Identity Continuity Rule

InnerMirror does not infer identity continuity across different authenticated identities.

```text
Same authenticated identity

↓

Same InnerMirror history


Different authenticated identity

↓

Different InnerMirror history
```

InnerMirror must not silently reconnect identities using:

- names,
- email similarity,
- repositories,
- project similarity,
- Reflection similarity,
- writing style,
- behavioral patterns,
- or inferred personal characteristics.

Identity continuity is controlled by the learner.

---

# 6. Core Persistence Domains

The MVP persistence model contains the following core domains.

```text
User

↓

Project

↓

Reflection

↓

Project Event

↓

Learning Journey
```

Supporting domains may include:

```text
Template Origin

Consent / Policy Record

Activity Record
```

Runtime-derived information is treated separately.

---

# 7. User Domain

## Purpose

The User domain establishes the ownership boundary for every InnerMirror record.

## Candidate Persistent Information

```text
user_id

github_provider_id

created_at

last_activity_at

account_status
```

Possible `account_status` values may include:

```text
active

inactive

deletion_pending
```

Exact implementation belongs to the future database schema.

---

# 8. What the User Domain Should Not Require

The MVP User domain should not require:

```text
GitHub email

postal address

phone number

real name

date of birth
```

unless a future service requirement establishes a separate lawful and necessary purpose.

The current MVP does not need these fields for project continuity.

---

# 9. Project Domain

The Project domain represents one learner-owned project journey.

Conceptually:

```text
User

↓

Project

↓

Repository Association

↓

Reflection / Events
```

Candidate persistent information:

```text
project_id

user_id

project_name

repository_owner

repository_name

repository_id

current_focus

project_status

started_at

updated_at
```

---

# 10. Repository Association

The repository association identifies the external GitHub project connected to an InnerMirror project.

InnerMirror should persist only enough repository information to maintain the project relationship.

Preferred persistent identity:

```text
repository_id
```

Supporting information may include:

```text
repository_owner

repository_name
```

Information such as:

```text
default_branch

repository_description

latest_commit

latest_pull_requests
```

should normally be retrieved again when analysis is requested unless persistence becomes necessary for a defined continuity purpose.

---

# 11. One Project, One Repository Principle

For the current Fribot Learning MVP:

```text
One Fribot Learning Project

=

One Export Repository

=

One InnerMirror Project
```

The repository remains available throughout the project.

New learner work continues through normal GitHub:

```text
branches

commits

pull requests
```

The learner is not required to recreate a repository for each new project step.

---

# 12. Template Origin Domain

Projects originating from Fribot Learning may retain their original template context.

Candidate persistent information:

```text
template_id

course_id

learning_goal

difficulty

estimated_duration
```

The most important persistent field is:

```text
template_id
```

because it establishes the original structured learning context.

Other template metadata should be stored only when necessary.

---

# 13. Reflection Domain

Reflection is one of the most important persistent InnerMirror domains.

Reflection represents learner-created source information.

Candidate persistent information:

```text
reflection_id

user_id

project_id

content

created_at
```

Optional future fields may include:

```text
reflection_type

source_context

related_event_id
```

These should not be added without a defined need.

---

# 14. Reflection Ownership

Reflection belongs to the learner.

Persistence does not transfer ownership to InnerMirror.

```text
Learner writes Reflection

↓

InnerMirror stores Reflection

↓

Learner remains owner
```

Reflection must remain associated with the authenticated user boundary.

---

# 15. First Question

A First Question may represent the learner's first serious inquiry within a project or knowledge domain.

Where this concept is implemented, it should be treated as learner-created source information.

Possible representation:

```text
first_question_id

user_id

project_id

content

created_at
```

However, the MVP should avoid creating a separate domain unless required.

A simpler implementation may classify a Reflection record as the project's first question.

---

# 16. Project Event Domain

Project Events record meaningful changes in the learner's project journey.

Examples:

```text
project_started

project_focus_changed

milestone_reached

pull_request_completed

project_paused

project_resumed

project_completed
```

Candidate persistent information:

```text
event_id

user_id

project_id

event_type

created_at

event_context
```

Only meaningful continuity events should become persistent records.

InnerMirror should not attempt to store every GitHub action as a Project Event.

---

# 17. Learning Journey Domain

The Learning Journey is not necessarily a separate physical table.

It is first a **domain relationship**.

Conceptually:

```text
Project

↓

Reflection

↓

Project Events

↓

Time

↓

Learning Journey
```

The learner's journey may therefore be reconstructed from persistent source records.

This is preferred over duplicating the entire journey as another large stored object.

---

# 18. Current Focus

Current Focus represents what the learner considers important at the current project stage.

It may be stored as part of the Project domain.

```text
Project.current_focus
```

Current Focus should be learner-controlled.

Runtime interpretation must not silently overwrite the learner's own declared focus.

---

# 19. External GitHub Evidence Domain

GitHub evidence should normally remain outside the permanent InnerMirror persistence domain.

Examples:

```text
recent commits

recent pull requests

default branch

repository metadata

GitHub snapshot
```

Preferred lifecycle:

```text
Learner requests analysis

↓

Fetch GitHub evidence

↓

Use for analysis

↓

Do not permanently duplicate unless required
```

---

# 20. GitHub Snapshot

The current MVP uses explicitly requested GitHub Snapshot capture.

Snapshot information is considered:

```text
External Evidence
```

rather than core learner source data.

Default persistence policy:

```text
TEMPORARY / RECREATABLE
```

If future continuity requires snapshot persistence, the reason and retention policy must be documented before implementation.

---

# 21. Complete Repository Data

The following must remain outside the current persistence domain:

```text
complete repository copy

complete source-code archive

complete Git history

unrelated GitHub activity
```

InnerMirror is not a GitHub backup service.

---

# 22. Runtime-Derived Intelligence

Runtime may generate:

```text
Summary

Recommendation

Next Question

Continuity Analysis

Patterns

Predictions
```

These are derived records.

They must not automatically receive permanent persistence status.

---

# 23. Derived Intelligence Principle

Preferred rule:

```text
Can be reconstructed reliably?

YES
↓

Regenerate


Required for meaningful continuity?

YES
↓

Consider persistence
```

Derived information should never be stored merely because it is available.

---

# 24. MVP Runtime Persistence

For the initial persistence architecture, the safest default is:

```text
Summary
→ TEMPORARY

Recommendation
→ TEMPORARY

Next Question
→ TEMPORARY

Prediction
→ TEMPORARY

Continuity Analysis
→ OPEN
```

Continuity Analysis may eventually require persistence, but this should be demonstrated by product need before adding permanent storage.

---

# 25. Consent and Policy Domain

InnerMirror should retain evidence necessary to know which service policies applied to the learner.

Candidate persistent fields:

```text
policy_record_id

user_id

privacy_version

terms_version

consent_type

accepted_at
```

Not every future policy requires explicit consent.

The database model should distinguish:

```text
policy acknowledgement

from

legal consent
```

where necessary.

---

# 26. Age Eligibility

The current MVP is available to users:

```text
14 years of age or older
```

The service should avoid collecting date of birth merely to enforce this policy unless necessary.

If explicit age eligibility confirmation is implemented, the preferred data model is a simple eligibility event rather than storing a birth date.

Example:

```text
age_eligibility_confirmed_at
```

---

# 27. Activity Domain

The current retention policy requires determining whether a user has been inactive for three years.

Therefore the persistence architecture requires a reliable:

```text
last_activity_at
```

field.

Activity should represent meaningful InnerMirror service activity.

The exact event that updates this timestamp must be defined during implementation.

---

# 28. Retention Model

Current policy:

```text
Active account

↓

Maintain records required for continuity


No activity for 3 years

↓

Delete InnerMirror learner records
```

The three-year period is a service retention policy.

It is not represented as a statutory retention period.

---

# 29. User-Requested Deletion

Complete deletion operates on the authenticated ownership boundary.

Conceptually:

```text
user_id

↓

projects

↓

reflections

↓

project_events

↓

policy-associated learner records

↓

derived persistent records

↓

DELETE
```

Deletion implementation must be able to demonstrate that the user's persistent history has been removed from active service storage.

---

# 30. Partial Deletion

The current MVP does not provide user-selectable deletion by:

```text
date

project

repository

Reflection

analysis category
```

This product policy does not override rights required by applicable law.

The database should nevertheless be structured so individual records can technically be managed where legally or operationally necessary.

---

# 31. GitHub Is Outside the Deletion Domain

The deletion boundary stops at InnerMirror-controlled data.

```text
Delete InnerMirror User

↓

InnerMirror Data
DELETED


GitHub Repository
UNCHANGED
```

InnerMirror must never implement account deletion by deleting the user's GitHub repository.

---

# 32. Data Domain Relationships

Conceptual MVP model:

```text
User
│
├── Project
│     │
│     ├── Reflection
│     │
│     ├── Project Event
│     │
│     └── Template Origin
│
├── Policy Records
│
└── Activity State
```

GitHub evidence remains external:

```text
Project

↓

GitHub Repository

↓

Fetch Evidence When Requested
```

Runtime intelligence is derived:

```text
Persistent Source Records

+

Requested GitHub Evidence

↓

Runtime

↓

Derived Intelligence
```

---

# 33. Persistence Priority

Persistence should be implemented in the following priority.

## Priority 1 — Identity

```text
User
```

## Priority 2 — Project

```text
Project
Repository Association
```

## Priority 3 — Reflection

```text
Reflection
```

## Priority 4 — Continuity

```text
Project Events
Current Focus
```

## Priority 5 — Governance

```text
Policy Records
Last Activity
```

## Priority 6 — Derived Intelligence

```text
Only where demonstrated necessary
```

---

# 34. Initial Supabase Domain Candidates

The first Supabase schema should remain minimal.

Candidate tables:

```text
profiles

projects

reflections

project_events

policy_acceptances
```

A separate table for:

```text
learning_journeys
```

is **not required initially** if the journey can be reconstructed from Projects, Reflections, and Events.

Likewise a separate table for Runtime intelligence should not be created until persistence is justified.

---

# 35. Profiles Domain

Conceptually:

```text
profiles
```

should contain only InnerMirror user-state fields that cannot be represented directly by Supabase Auth.

Candidate fields:

```text
user_id

github_provider_id

created_at

last_activity_at

account_status
```

Avoid duplicating unnecessary Supabase Auth profile information.

---

# 36. Projects Domain

Conceptual table:

```text
projects
```

Candidate fields:

```text
id

user_id

name

repository_id

repository_owner

repository_name

template_id

current_focus

status

created_at

updated_at
```

---

# 37. Reflections Domain

Conceptual table:

```text
reflections
```

Candidate fields:

```text
id

user_id

project_id

content

created_at
```

The initial schema should remain intentionally small.

---

# 38. Project Events Domain

Conceptual table:

```text
project_events
```

Candidate fields:

```text
id

user_id

project_id

event_type

event_context

created_at
```

Whether `event_context` should be structured JSON or text should be decided during schema design.

---

# 39. Policy Acceptance Domain

Conceptual table:

```text
policy_acceptances
```

Candidate fields:

```text
id

user_id

policy_type

policy_version

accepted_at
```

Only records actually required for governance or lawful consent should be stored.

---

# 40. User-Level Isolation

Every persistent user-owned table must support strict ownership isolation.

Conceptually:

```text
record.user_id

=

authenticated user.id
```

This must be enforced server-side and through database authorization.

UI filtering alone is not a security boundary.

---

# 41. Row Level Security Requirement

Before production learner data is stored:

```text
RLS
MUST BE ENABLED
```

for applicable user-owned Supabase tables.

Policies must prevent one user from:

- reading,
- inserting,
- updating,
- or deleting

another user's learner records.

Exact SQL belongs to the future database implementation document.

---

# 42. Credential Boundary

Authentication credentials do not belong in normal persistence domains.

Examples:

```text
GitHub provider token

Supabase service role key

Runtime secrets
```

must be handled separately as security credentials.

They must never be stored in learner-facing database tables.

---

# 43. Persistence Does Not Mean Logging Everything

Operational logs must remain separate from learner continuity records.

The application should not use general application logging as an accidental personal-data archive.

Logs must have:

```text
defined purpose

defined access

defined retention
```

before production operation.

---

# 44. Sensitive Information Boundary

Reflection may unintentionally contain sensitive information.

Therefore:

```text
Reflection

↓

High Privacy Attention
```

The database architecture should not copy Reflection content into multiple derived tables unnecessarily.

Derived intelligence should preferably reference source records rather than duplicating full Reflection text.

---

# 45. Backup and Deletion

Future database implementation must review how deletion interacts with:

```text
database backups

point-in-time recovery

logs

replicas
```

An account deletion feature is incomplete if active records are deleted but the service has no defined policy for retained backup copies.

The exact implementation remains:

```text
OPEN
```

---

# 46. Production Region

The Supabase production project region has not yet been finalized.

Status:

```text
OPEN
```

A new production-oriented Supabase project may be created rather than preserving experimental pre-production data.

Region choice must be reviewed before persistent learner data is introduced.

---

# 47. Legacy Test Data

Existing Supabase experimental tables and records created before the InnerMirror persistence architecture are not authoritative production records.

They may be removed before production initialization.

The production schema should be created from the approved persistence model rather than constrained by legacy test structures.

---

# 48. Schema Design Gate

A database table may be introduced only when the following questions have clear answers:

```text
Why is this data needed?

Who owns it?

What is its source?

Must it persist?

How long is it retained?

How is it deleted?

Who can access it?

Can it be reconstructed instead?
```

If these questions cannot be answered, persistence should not be introduced.

---

# 49. Current MVP Persistence Summary

```text
User Identity
→ PERSIST

Project Identity
→ PERSIST

Repository Association
→ PERSIST MINIMUM

Reflection
→ PERSIST

Current Focus
→ PERSIST

Project Events
→ PERSIST

Template ID
→ PERSIST

Learning Journey
→ RECONSTRUCT FROM SOURCE RECORDS

GitHub Snapshot
→ RETRIEVE / TEMPORARY

Recent Commits
→ RETRIEVE

Recent Pull Requests
→ RETRIEVE

Complete Source Code
→ DO NOT STORE

GitHub Email
→ DO NOT STORE

Runtime Summary
→ TEMPORARY

Runtime Recommendation
→ TEMPORARY

Runtime Prediction
→ TEMPORARY

Continuity Intelligence
→ OPEN

Policy Records
→ PERSIST WHERE REQUIRED

Last Activity
→ PERSIST
```

---

# 50. Relationship to Other Documents

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
        ↓
RLS / SECURITY IMPLEMENTATION
```

Each document narrows the decision boundary.

`PERSISTENCE_DOMAIN_MODEL.md` is the final architectural layer before concrete database schema design.

---

# Foundation Rule

Persist human continuity.

Retrieve external evidence.

Regenerate derived intelligence where possible.

Keep identity minimal.

Keep ownership explicit.

Do not infer hidden identity.

Do not duplicate GitHub.

Do not persist because persistence is convenient.

Every permanent record must justify its existence.