# InnerMirror Supabase Migration Plan

> **Migration Authority Notice**
>
> This document is retained in the Landing repository as an architectural
> and historical reference for the InnerMirror Supabase database foundation.
>
> The Landing repository is **not** the authoritative source of executable
> Supabase migrations.
>
> The authoritative migration sequence is maintained exclusively in:
>
> ```text
> fribot-labs/innermirror-runtime-private
> └─ supabase/
>    └─ migrations/
> ```
>
> Do not add, execute, or version new production database migrations from
> `innermirror-landing`.
>
> All future executable database migrations must be introduced through
> `innermirror-runtime-private`.

---

# 1. Purpose

This document preserves the architectural rationale that shaped the original
InnerMirror Supabase database design.

It remains useful for understanding:

- learner ownership
- persistence boundaries
- authentication relationships
- Row Level Security principles
- deletion requirements
- migration design considerations
- production verification expectations

This document does **not** define the current executable migration sequence.

Executable migration history and all future database schema changes belong to:

```text
innermirror-runtime-private/supabase/migrations/
```

The Landing may depend on the resulting public database contracts through
approved browser-facing Supabase access, but it does not own database migration
implementation.

---

# 2. Migration Philosophy

The production database must never be created by improvisation.

Database implementation must remain consistent with approved architecture,
while executable migrations are maintained exclusively in
`innermirror-runtime-private`.

The architectural reasoning remains:

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

Architecture must exist before implementation.

Migration implementation must preserve:

- learner ownership
- privacy
- deletion rights
- service responsibility boundaries
- minimum necessary persistence
- browser/server credential separation

---

# 3. Migration Authority

There is one authoritative InnerMirror Supabase migration history.

```text
innermirror-runtime-private
        ↓
supabase/migrations/
        ↓
001
002
003
...
future migrations
```

The Runtime repository owns executable migration authority for:

- public InnerMirror schema
- profile provisioning
- Row Level Security
- Projects
- Reflections
- Project Events
- Policy Acceptance
- deletion functions
- indexes and constraints
- Product Observation schema
- Product Observation private access
- Runtime database access
- future database infrastructure

The Landing repository does not maintain a parallel migration sequence.

```text
innermirror-landing
        ↓
NO executable migration authority
```

---

# 4. Why Migration Authority Is Centralized

Maintaining migration copies in more than one repository creates ambiguity.

For example:

```text
Landing migrations
        ↘
         Which sequence is authoritative?
        ↗
Runtime migrations
```

This becomes increasingly unsafe as the database evolves.

A single authoritative migration sequence provides:

- one schema history
- one ordering authority
- one rollback history
- one source for production deployment
- one place for access-control changes
- one place for Product Observation persistence changes
- less risk of divergent migration copies

Therefore:

```text
Database migration ownership
=
innermirror-runtime-private
```

---

# 5. Landing Responsibility

The Landing is responsible for browser-facing application behavior.

This includes:

```text
Supabase authentication
        ↓
authenticated learner session
        ↓
learner-owned public data access
        ↓
Runtime communication
        ↓
presentation
```

The Landing may:

- authenticate through approved Supabase browser credentials
- read learner-owned records permitted by RLS
- write learner-owned records permitted by RLS
- call approved database functions
- send authenticated requests to the private Runtime

The Landing must not:

- define production migration ordering
- introduce schema migrations
- introduce Product Observation tables
- define server-only database privileges
- store service-role credentials
- bypass RLS
- become a second migration authority

---

# 6. Runtime Responsibility

The private Runtime repository owns the executable database evolution boundary.

Conceptually:

```text
Architecture
        ↓
Migration Review
        ↓
innermirror-runtime-private
        ↓
supabase/migrations/
        ↓
Supabase Production Database
```

The Runtime migration authority includes changes to:

```text
public schema
Product Observation schema
RLS
database functions
constraints
indexes
grants
revokes
server access
deletion infrastructure
```

This authority does not mean the Runtime owns learner data.

Ownership remains defined by the service architecture and database
authorization model.

---

# 7. Original Database Foundation

The original InnerMirror database foundation was organized around the following
domains:

```text
profiles
projects
reflections
project_events
policy_acceptances
```

These domains established the first persistent InnerMirror ownership model.

They remain useful architectural concepts even though the executable migration
history is now maintained elsewhere.

---

# 8. Profiles

## Purpose

Create the application-level learner ownership root.

Primary relationship:

```text
auth.users.id
        ↓
public.profiles.user_id
```

The profile exists for application continuity.

It is not a second authentication database.

Core profile responsibilities include:

- application ownership root
- account lifecycle state
- continuity support
- relationship root for learner-owned records

The profile should remain minimal.

---

# 9. Profile Provisioning

Profile provisioning is database-managed.

Conceptually:

```text
Supabase Auth
        ↓
auth.users INSERT
        ↓
database trigger
        ↓
public.profiles
```

The Landing must not become responsible for manually creating the ownership
root after authentication.

This prevents:

- browser provisioning races
- duplicate ownership paths
- unnecessary client INSERT authority
- inconsistent account initialization

Profile provisioning must remain:

- minimal
- deterministic
- version-controlled
- separately reviewable

---

# 10. Projects

## Purpose

Projects establish learner-owned project continuity.

Conceptually:

```text
Learner
        ↓
Project
        ↓
Repository identity
        ↓
Project state
```

Project persistence may contain fields such as:

```text
id
user_id
repository_id
repository_owner
repository_name
current_focus
status
started_at
created_at
updated_at
```

Repository identity must remain stable independently of mutable repository
presentation values.

---

# 11. Reflections

## Purpose

Persist learner-created Reflection.

Conceptually:

```text
Learner
        ↓
Reflection
        ↓
optional Project relationship
```

Reflection ownership follows:

```text
reflections.user_id
=
authenticated learner
```

Reflection may be:

- project-owned
- standalone

Raw Reflection belongs to the canonical InnerMirror persistence domain.

Product Observation must not duplicate unrestricted raw Reflection content.

---

# 12. Project Events

## Purpose

Persist meaningful Project lifecycle events.

Examples include:

```text
project created
project started
project focus updated
project completed
```

Project Event persistence supports continuity without requiring continuous
background monitoring.

Events remain learner-owned canonical records.

---

# 13. Policy Acceptances

## Purpose

Record explicit learner acknowledgement of the applicable service policy.

Typical information includes:

```text
user_id
policy_type
policy_version
acceptance_type
accepted_at
```

Policy Acceptance is service-governance data associated with the authenticated
learner.

Deletion behavior must remain consistent with the current service deletion
contract.

---

# 14. Repository Identity

Repository identity must not rely only on mutable repository names.

The stable relationship is based on the repository identity supplied by GitHub.

Conceptually:

```text
GitHub repository.id
        ↓
Landing repositoryId
        ↓
projects.repository_id
        ↓
project.id
```

This allows:

- stable Project identity
- repository rename tolerance
- canonical Project relationships
- Reflection linkage
- Project Event linkage

---

# 15. Indexes

Indexes support ownership and continuity queries.

Relevant query patterns include:

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

Indexes should exist only when they support an identified query or integrity
requirement.

Migration implementation should avoid speculative indexing.

---

# 16. Row Level Security

RLS protects learner-owned public data.

The fundamental ownership model is:

```text
auth.uid()
=
row.user_id
```

or an equivalent ownership relationship derived through canonical foreign keys.

RLS must prevent:

```text
User A
        ↓
User B data
```

from being accessed.

Browser authorization must remain intentionally narrower than server-side
Runtime access.

---

# 17. Anonymous Access

Anonymous access must not expose learner-owned records.

Conceptually:

```text
anonymous
        ↓
learner-owned public tables
        ↓
DENY
```

Public service presentation and learner-owned database persistence are separate
concerns.

---

# 18. Browser Credential Boundary

The Landing may use only Supabase credentials intended for browser use.

Browser-accessible environment variables must never contain:

```text
database password
service-role key
Runtime server key
private Product Observation credential
server-only secrets
```

Variables prefixed with:

```text
VITE_
```

are client-visible and must be treated accordingly.

---

# 19. Service Role Boundary

Service-role credentials are server-only.

```text
SERVICE ROLE
        ↓
PRIVATE SERVER / RUNTIME ONLY
```

They must never be:

- included in Landing source
- embedded in browser bundles
- returned through HTTP
- logged
- stored in localStorage
- exposed through diagnostics

The service-role boundary must remain distinct from learner authentication.

---

# 20. Authentication and Authorization

Authentication answers:

```text
Who are you?
        ↓
Supabase Auth
```

Authorization answers:

```text
Which records may you access?
        ↓
PostgreSQL / RLS
```

These responsibilities must remain separate.

A successful OAuth login does not grant unrestricted database access.

---

# 21. GitHub Authorization Boundary

GitHub authorization and InnerMirror database authorization are different.

```text
GitHub authorization
≠
InnerMirror database authorization
```

GitHub credentials authorize access to GitHub-connected functionality.

Supabase authenticated identity establishes InnerMirror database ownership.

GitHub identifiers must not silently replace the canonical InnerMirror
ownership identifier.

---

# 22. Canonical InnerMirror Identity

The canonical InnerMirror ownership root is based on:

```text
auth.users.id
```

The relationship is conceptually:

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

Application code must not create a competing ownership identity.

---

# 23. InnerMirror Data Deletion

Canonical InnerMirror deletion is a coordinated service action.

Current learner-data deletion preserves:

```text
auth.users
public.profiles
```

while deleting learner-owned service data such as:

```text
project_events
reflections
projects
policy_acceptances
```

The canonical deletion function derives ownership from the authenticated
Supabase identity.

Conceptually:

```text
authenticated learner
        ↓
auth.uid()
        ↓
delete learner-owned InnerMirror data
```

Generic browser-side arbitrary deletion of ownership roots is not the deletion
architecture.

---

# 24. Product Observation Deletion Relationship

Product Observation uses a separate pseudonymous subject identity.

Conceptually:

```text
auth user
        ↓
verified userId
        ↓
Product Observation subject mapping
        ↓
subjectRef
```

The browser does not own or select:

```text
subjectRef
```

When the learner requests deletion of InnerMirror data:

```text
verified account
        ↓
current subjectRef resolution
        ↓
subject-linked Product Observation deletion
        ↓
canonical InnerMirror deletion
```

Old user-linkable Product Observation history must not remain reconnectable
after deletion.

---

# 25. Product Observation Migration Boundary

Product Observation persistence belongs only to the private Runtime migration
authority.

The Landing must not contain executable migrations for:

```text
Product Observation subjects
Evidence References
Derived Observations
Observation Evidence
Service Review Signals
Signal Evidence
private access
Runtime service-role access
```

These belong exclusively to:

```text
innermirror-runtime-private
```

---

# 26. Product Observation Privacy Boundary

Product Observation migration design must preserve the separation:

```text
Landing / browser
        X
product_observation

Private Runtime
        ↓
product_observation
```

The browser must not gain access merely because Product Observation data exists
in the same Supabase project.

Migration design must preserve:

- explicit private access
- server-only credentials
- no learner-facing Product Observation RLS path unless separately approved
- no unrestricted raw Reflection duplication
- no direct learner identity in Service Review Signal records

---

# 27. One Supabase Project, One Migration Sequence

InnerMirror may use one Supabase project for multiple schemas and service
boundaries.

That does not imply multiple migration authorities.

The rule is:

```text
One Supabase project
        ↓
One authoritative migration sequence
        ↓
innermirror-runtime-private
```

Public schema and private Product Observation schema migrations must remain in
one ordered history.

---

# 28. Migration Numbering

Migration numbering belongs to the authoritative Runtime repository.

Landing documentation must not invent a competing executable migration number.

Future migration numbering continues from the Runtime repository's current
authoritative sequence.

Therefore this document must not be used to determine:

```text
the next executable migration number
```

Developers must inspect:

```text
innermirror-runtime-private/supabase/migrations/
```

before creating any migration.

---

# 29. Migration Review Questions

Every database migration must answer:

```text
Why is this change needed?

Who owns the affected data?

Which service layer owns the behavior?

How is authorization enforced?

How is deletion handled?

How long is the data retained?

Can the browser access it?

Does it require server-only credentials?

Does it create a new identity relationship?

Does it alter an existing privacy boundary?
```

If these questions cannot be answered, the migration should not proceed.

---

# 30. Schema Change Rule

Schema changes must not be introduced indirectly through application code.

Examples of prohibited drift include:

```text
Landing code assumes new column
but no authoritative migration exists

Runtime code assumes new table
but migration history was not updated

manual production SQL
without version-controlled migration
```

Schema evolution must remain version-controlled.

---

# 31. RLS Change Rule

RLS changes are migration changes.

They must be reviewed with the same rigor as table changes.

A new RLS policy must answer:

- who receives access
- which operation is allowed
- which ownership predicate is used
- whether anonymous access changes
- whether service-role behavior changes
- whether the policy expands browser authority

RLS must never evolve implicitly through convenience changes.

---

# 32. Function Change Rule

Database functions are part of migration authority.

Functions such as coordinated deletion must be:

- version-controlled
- privilege-reviewed
- explicit about caller identity
- tested
- documented
- consistent with privacy policy

A function using:

```text
SECURITY DEFINER
```

requires particular care because its privileges may exceed those of the caller.

---

# 33. Grant and Revoke Rule

Privileges are part of schema governance.

Migration review must consider:

```text
PUBLIC
anon
authenticated
service_role
```

explicitly.

Granting access is an architectural decision, not merely an implementation
detail.

Private Runtime schemas must fail closed by default.

---

# 34. Default Privilege Rule

When future objects may be created inside a private schema, default privileges
must be considered.

The migration must avoid a state where a newly created table or sequence becomes
browser-accessible merely because explicit revocation was forgotten.

Future-object privileges should be deliberate.

---

# 35. Foreign Key Rule

Foreign keys must express the intended ownership and deletion model.

Review must include:

```text
parent identity
child identity
ON DELETE behavior
cross-schema relationships
```

Cascade behavior must not accidentally delete:

- unrelated product-level records
- preserved account records
- GitHub data
- independent aggregate records

---

# 36. Cascade Deletion Rule

Cascade deletion is appropriate only where the child record is structurally
owned by the parent.

A migration introducing:

```text
ON DELETE CASCADE
```

must document why that relationship represents ownership rather than merely
association.

Deletion must remain understandable and testable.

---

# 37. Product-level Records

Not every Product Observation record is necessarily owned by one learner.

For example, Product-level Service Review Signals may survive removal of an
individual supporting relationship when they no longer contain a direct
subject relationship.

The migration architecture must distinguish:

```text
user-linkable data
```

from:

```text
product-level investigation data
```

Retention of non-linkable aggregate or product-level data requires separately
approved policy.

---

# 38. Raw Content Principle

Schema design must avoid unnecessary duplication of raw learner content.

Product Observation evidence should rely on bounded provenance references rather
than unrestricted copies of:

```text
Reflection content
Question content
GitHub payload
commit body
pull request body
```

unless a separately approved service purpose requires otherwise.

---

# 39. Derived Data Principle

Derived Product Observation data does not automatically become exempt from
deletion merely because it is derived.

If derived data remains linkable to the learner through:

```text
subjectRef
projectRef
repositoryRef
other persistent identity
```

it remains part of the user-linkable deletion boundary.

---

# 40. Growth Trace Principle

Growth Trace is not durable learner scoring.

Current architecture treats Growth Trace as:

```text
recomputable
```

rather than a mandatory persisted database record.

A future migration must not silently create:

```text
Growth Score
learner rank
learner risk score
personality score
```

without a separately approved product and privacy design.

---

# 41. Cohort Principle

Cohort interpretation is a Product Observation analysis concern.

Current architecture does not require durable learner cohort membership as a
canonical persistence table.

A future migration introducing persistent cohort membership requires separate
review of:

- purpose
- linkability
- deletion
- retention
- admin access
- learner impact

---

# 42. Admin View Principle

Administrative Product Observation views should remain derived where possible.

A migration should not persist redundant Admin View records merely for display.

Admin access is a separate authorization boundary from persistence.

---

# 43. Production Verification

Migration execution is not complete merely because SQL succeeds.

Production verification must include, where relevant:

```text
schema exists
constraints exist
RLS enabled
expected grants applied
unexpected grants absent
cross-user isolation works
browser access boundary works
Runtime access works
deletion works
retry behavior works
privacy policy matches implementation
```

---

# 44. Cross-user Isolation

Before learner-owned persistence is production-ready:

```text
User A
        ↓
User B records
        ↓
DENY
```

must be verified.

Testing should cover:

- SELECT
- INSERT ownership
- UPDATE ownership
- DELETE ownership
- function ownership behavior

where applicable.

---

# 45. Private Schema Isolation

Before private Runtime persistence is production-ready:

```text
PUBLIC
→ DENY

anon
→ DENY

authenticated
→ DENY

Runtime approved server identity
→ only approved access
```

must be verified.

Browser availability of the Supabase project does not imply browser access to
every schema.

---

# 46. Deletion Verification

Deletion verification must include both canonical InnerMirror records and
user-linkable private Product Observation records.

Conceptually:

```text
Delete My InnerMirror Data
        ↓
private subject-linked deletion
        ↓
canonical learner-data deletion
        ↓
no reconnectable old Product Observation identity
```

The preserved login account must not cause deleted Product Observation history
to reappear.

---

# 47. Retry Safety

Deletion and other multi-step database workflows should be retry-safe where
possible.

For example:

```text
step A succeeds
step B fails
        ↓
retry
```

should not corrupt state or recreate deleted identity.

Deterministic IDs, idempotent operations, and explicit failure semantics should
be preferred where full transactional boundaries are unavailable.

---

# 48. Transaction Rule

Strong transaction guarantees should be used where supported and justified.

However, migration architecture must not falsely claim atomicity when a workflow
uses multiple independent requests.

If a workflow is intentionally:

```text
deterministic
+
idempotent
+
multi-step
```

the limitation should be documented.

A transactional RPC may be introduced later when required by the product risk.

---

# 49. Rollback Rule

Every migration must consider rollback or forward-recovery behavior.

Rollback review includes:

```text
schema
constraints
indexes
functions
policies
grants
default privileges
relationships
```

Rollback must not leave the database in an inconsistent ownership or
authorization state.

For destructive migrations, forward recovery may be safer than literal rollback
and should be documented accordingly.

---

# 50. Production Data Rule

Production migrations must not assume that development data conditions also
exist in production.

Before applying changes, review:

- existing rows
- nullable values
- foreign-key compatibility
- uniqueness conflicts
- existing Auth users
- existing profiles
- existing policy records
- existing Product Observation subjects

Backfill operations require explicit review.

---

# 51. Manual SQL Rule

Production database state should not drift through unrecorded manual SQL.

If emergency SQL is ever required, the resulting intended schema state must be
reconciled with the authoritative migration history.

The canonical history remains:

```text
innermirror-runtime-private/supabase/migrations/
```

---

# 52. Development Environment Rule

Local Supabase CLI state is not migration authority.

Files or folders such as:

```text
supabase/.temp
supabase/.branches
local snippets
generated CLI state
```

must not be treated as production schema history.

Only version-controlled authoritative migrations define the intended migration
sequence.

---

# 53. SQL Snippet Rule

SQL snippets are development aids.

They are not:

```text
migrations
production authority
schema history
deployment records
```

A useful snippet that becomes part of production behavior must be converted
into a reviewed authoritative migration in the Runtime repository.

---

# 54. Landing Repository Rule

The Landing repository must not reintroduce:

```text
supabase/migrations/
```

as a parallel executable migration history.

If a future Landing feature requires a database change:

```text
Landing requirement
        ↓
architecture review
        ↓
Runtime migration PR
        ↓
database migration
        ↓
Landing feature dependency
```

The schema change must be introduced at the migration authority rather than in
the browser repository.

---

# 55. Cross-repository Change Rule

Some product changes may require both repositories.

For example:

```text
Runtime migration
        ↓
Runtime implementation
        ↓
Landing transport or UI
```

These should be split into reviewable PRs when possible.

Recommended dependency order:

```text
database / Runtime first
        ↓
Landing consumer second
```

This prevents the Landing from depending on database or Runtime capabilities
that do not yet exist.

---

# 56. Migration Documentation Rule

Every significant migration should document:

- migration purpose
- affected tables or functions
- ownership model
- access model
- deletion model
- production impact
- verification performed
- known limitations

Migration documentation belongs next to the authoritative Runtime migration
history or its Runtime governance documentation.

Landing documents may explain dependencies, but they should not duplicate the
executable migration source.

---

# 57. Historical Plan Status

The original Landing migration plan described an early conceptual sequence such
as:

```text
profiles
projects
reflections
project_events
policy_acceptances
indexes
RLS
verification
```

That sequence remains useful as historical architecture context.

It is **not** the current executable migration numbering authority.

The current authoritative sequence must always be read directly from:

```text
fribot-labs/innermirror-runtime-private/supabase/migrations/
```

This distinction prevents historical architecture documentation from being
mistaken for deployment instructions.

---

# 58. Future Migrations

Future database domains must be introduced only after demonstrated product need
and architecture approval.

Potential future persistence must not be assumed merely because a Runtime
concept exists.

Examples requiring separate review include:

```text
long-term aggregates
new Product Observation records
admin-specific persistence
retention automation
identity migration
additional authentication providers
new private schemas
```

Each requires its own ownership, privacy, deletion, and access analysis.

---

# 59. Migration Creation Checklist

Before creating a new migration in the Runtime repository:

```text
□ Product need documented

□ Repository responsibility confirmed

□ Ownership model defined

□ Privacy impact reviewed

□ Deletion behavior defined

□ Retention behavior defined

□ Browser access requirement defined

□ Runtime access requirement defined

□ RLS / grants reviewed

□ Foreign-key behavior reviewed

□ Migration number verified against Runtime authority

□ Production verification plan prepared

□ No competing Landing migration introduced
```

---

# 60. Production Gate

A database change is production-ready only after relevant checks are complete.

```text
□ Authoritative migration exists in Runtime

□ Migration ordering verified

□ Schema verified

□ Constraints verified

□ RLS verified

□ Grants / revokes verified

□ Cross-user isolation verified

□ Private schema isolation verified

□ Canonical deletion verified

□ Product Observation deletion verified when applicable

□ Browser credentials contain no server secrets

□ Runtime credentials remain server-only

□ Privacy documentation matches implementation

□ Data Ownership documentation matches implementation

□ Legal Foundation remains consistent
```

---

# 61. Governance Boundary

The database exists to support the service architecture.

Migration authority does not redefine:

- learner ownership
- service responsibility
- privacy rights
- authentication identity
- GitHub ownership
- deletion rights

Migrations implement previously approved architecture.

They do not silently create new product policy.

---

# 62. Current Repository Boundary

The current boundary is:

```text
innermirror-landing
        ↓
learner experience
browser Supabase access
Runtime transport
presentation
        ↓
NO migration authority


innermirror-runtime-private
        ↓
private Runtime
Product Observation
database governance
authoritative migrations
        ↓
Supabase
```

This boundary applies to all future database work unless explicitly changed by
a separately approved governance decision.

---

# 63. Foundation Statement

Migration follows architecture.

Architecture follows ownership.

Ownership follows the learner.

The database exists to preserve learner continuity.

Executable migration authority belongs to one repository.

That repository is:

```text
innermirror-runtime-private
```

The Landing consumes approved database capabilities.

It does not define the database migration history.

No migration should weaken:

```text
ownership
privacy
deletion rights
authorization
service boundaries
```

Migration authority must remain singular, explicit, and reviewable.