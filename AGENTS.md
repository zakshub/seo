# Agent Working Agreement

Read `docs/00_READ_ME_FIRST.md`, `docs/PHASE_STATUS.md`, and the relevant ADRs before work. Treat PostgreSQL state and the immutable event history as authoritative; UI state is a projection only.

Do not fabricate external work or put credentials in tracked files. Add a provider only behind a `packages/providers` adapter, capability declaration, budget check, and redacted audit/event path. Any consequential command must pass policy evaluation before execution. Keep documentation and `PHASE_STATUS.md` synchronized with actual implementation. Prefer small commits that run the affected typecheck and tests.

The canonical design workspace is the supplied Figma file, but it is not callable until Phase 4 and verified access exists. `zakshub/designer` is a future pinned adapter dependency subject to license and security review; do not vendor it.
