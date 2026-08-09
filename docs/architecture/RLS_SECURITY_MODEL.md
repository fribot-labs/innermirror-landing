# RLS_SECURITY_MODEL.md

# InnerMirror Row Level Security Model

> **Purpose**
>
> This document defines how ownership boundaries are enforced inside the
> InnerMirror database.
>
> It is the security architecture that protects learner-owned information.

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

↓

RLS_SECURITY_MODEL.md
```

---

# 1. Philosophy

The learner owns every InnerMirror record.

Database security exists to preserve that ownership.

The database must never trust:

- UI filtering
- client-side code
- browser state

Ownership must be enforced by the database itself.

---

# 2. Security Principle

The fundamental rule is:

```text
Authenticated User

↓

Owns Records

↓

May Access Only
Their Own Records
```

No learner should ever be able to:

- read,
- update,
- delete,
- insert

another learner's private records.

---

# 3. Ownership Boundary

The ownership boundary is:

```text
auth.users.id

↓

profiles.user_id

↓

Every Persistent Record
```

Every user-owned table must contain:

```text
user_id
```

Every RLS policy ultimately validates:

```text
auth.uid()

=

record.user_id
```

---

# 4. Protected Tables

The MVP protects:

```text
profiles

projects

reflections

project_events

policy_acceptances
```

Future tables inherit the same ownership model.

---

# 5. Profiles

Conceptually

```text
profiles.user_id

=

auth.uid()
```

A learner:

✓ may read

✓ may update

their own profile.

They may never access another learner's profile.

---

# 6. Projects

Projects belong to one learner.

```text
projects.user_id

=

auth.uid()
```

Projects must never be visible across users.

---

# 7. Reflections

Reflection is the highest privacy record.

Every Reflection belongs to:

```text
reflection.user_id
```

The database must reject:

```text
SELECT

UPDATE

DELETE
```

when

```text
reflection.user_id

≠

auth.uid()
```

---

# 8. Project Events

Project Events inherit ownership from the project.

Conceptually

```text
project.user_id

=

project_event.user_id
```

Both relationships should remain consistent.

---

# 9. Policy Records

Policy acceptance belongs only to the learner.

Users may view only their own policy history.

Administrative access must remain separate.

---

# 10. Runtime

Runtime never bypasses ownership.

Runtime receives:

```text
Authenticated User

↓

Authorized Records

↓

Analysis
```

Runtime must never analyze records belonging to another learner.

---

# 11. Service Role

Supabase Service Role bypasses RLS.

Therefore:

```text
Service Role

↓

Server Only
```

The Service Role key must never:

- appear in browser code,
- appear in VITE variables,
- be exposed to learners.

---

# 12. Browser

The browser uses only:

```text
Supabase Auth Session
```

The browser must never decide ownership.

Ownership belongs to the database.

---

# 13. Authentication

Authentication answers:

```text
Who are you?
```

Authorization answers:

```text
What may you access?
```

RLS implements authorization.

---

# 14. GitHub

GitHub identity does not replace InnerMirror ownership.

```text
GitHub

↓

Authentication

↓

InnerMirror User

↓

Database Ownership
```

GitHub username alone must never determine access.

---

# 15. Identity Merge

Current MVP

```text
NOT SUPPORTED
```

Different authentication identities remain different learners.

The database never attempts hidden identity reconstruction.

---

# 16. Cross User Access

The following must always fail.

```text
User A

↓

Reflection of User B

↓

DENY
```

The same applies to:

- Projects
- Events
- Policy Records

---

# 17. Cascade Deletion

Complete account deletion removes:

```text
profiles

↓

projects

↓

reflections

↓

project_events

↓

policy_acceptances
```

GitHub repositories remain untouched.

---

# 18. Logging

Application logs are not learner records.

Logs must never become:

```text
Reflection Backup
```

Sensitive Reflection content should not be copied into logs.

---

# 19. Derived Intelligence

Runtime-derived information inherits learner ownership.

If persisted:

```text
derived.user_id

=

auth.uid()
```

The same ownership rules apply.

---

# 20. Future Tables

Any future table must answer:

```text
Who owns it?

How is ownership enforced?

How is deletion performed?
```

If these questions cannot be answered,

the table should not exist.

---

# 21. Production Checklist

Before production:

```text
□ RLS enabled

□ All protected tables verified

□ Cross-user read test

□ Cross-user update test

□ Cross-user delete test

□ Reflection ownership test

□ Project ownership test

□ Service Role isolation

□ Browser secrets verified

□ Deletion verified
```

---

# 22. Security Principle

Ownership is enforced by the database.

Not by the browser.

Not by React.

Not by Runtime.

Not by GitHub.

The database is the final authority.

---

# Foundation Statement

Every learner owns their own records.

Every database record belongs to one learner.

No learner can access another learner's history.

Ownership is verified by the database.

Security preserves ownership.