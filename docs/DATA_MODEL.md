# Data Model Reference

All aggregate tables use UUID primary keys, workspace ID, created/updated timestamps, optimistic version, and audit correlation. `EvidenceItem` includes subject, source kind/URL/provider, capturedAt, excerpt/reference, locale, confidence, retention status, and integrity hash. `Opportunity` references evidence and holds lifecycle status. `Evaluation` is versioned and references its opportunity/evidence. `Project` originates from one approved opportunity.

`WorkflowRun`, `WorkflowStep`, and `AgentRun` retain state, temporal workflow identifiers, idempotency keys, attempts, timestamps, and failure references. `ApprovalRequest` snapshots material inputs and policy result; `ApprovalDecision` is immutable. `OutboxEvent` is append-only and published at least once; consumers deduplicate by event ID.
