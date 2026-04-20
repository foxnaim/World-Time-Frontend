# Architecture Decision Records

This directory holds the Architecture Decision Records (ADRs) for Work Tact.
An ADR captures a single, significant, hard-to-reverse decision — the
context that forced the choice, the options we considered, the decision we
took, and the consequences we accepted.

We use the [MADR 4.0](https://adr.github.io/madr/) format.

## When to write an ADR

Write an ADR when a decision:

- Is **architecturally significant**: it shapes the system boundary, the
  data model, a cross-cutting policy, or the developer experience for
  everyone.
- Is **hard to reverse**: undoing it later would mean a migration, a
  rewrite, a breaking API change, or a coordination project.
- Will **outlast** the person making it: the reasoning needs to survive
  turnover.

Do **not** write an ADR for:

- Tactical code-level choices (naming, module layout, minor refactors).
- Decisions already implicit in a framework we have adopted (e.g. "we
  use Next.js file-based routing" — yes, that is how Next.js works).
- Reversible experiments.

Rule of thumb: if a new contributor six months from now would ask _"why
did we do it this way?"_ and the answer is non-obvious, write an ADR.

## Numbering

- ADRs are numbered sequentially starting at `0001`.
- The filename is `NNNN-kebab-case-title.md`.
- Numbers are **never reused**. If an ADR is superseded, write a new one
  and mark the old one `Superseded by ADR-NNNN`.

## Status lifecycle

Every ADR has a status:

- `Proposed` — drafted, under discussion, not yet committed to.
- `Accepted` — in force. This is the state most ADRs live in.
- `Deprecated` — no longer guiding decisions, but not explicitly replaced.
- `Superseded by ADR-NNNN` — replaced by a newer record; the replacement
  references this one in its own Context section.

Status is a header at the top of the ADR. Changes to status are themselves
recorded by editing the ADR and committing the change.

## Template

Use [`template.md`](./template.md) as the starting point for a new ADR.
Copy it, renumber, fill in the sections, and open a pull request.

## Review

An ADR is ready to merge when:

- The Context explains the forcing function, not just the topic.
- At least one alternative is described with enough detail that a reader
  can understand why it was rejected.
- The Decision is unambiguous — a reader can tell _exactly_ what was
  decided, not merely what was discussed.
- The Consequences section names both benefits and tradeoffs; an ADR with
  only benefits is suspect.

## Current ADRs

See [`../README.md`](../README.md) for the full indexed list.
