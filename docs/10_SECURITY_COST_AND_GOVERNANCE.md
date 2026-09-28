# Security, Cost, and Governance

Secrets use environment variables locally and a secret-manager reference in production. Redaction applies before events, audit details, errors, and frontend responses. Audit logs are append-only and record actor, policy decision, target, before/after references, and correlation ID.

Every billable/provider action requires capability permission, budget check, estimate, and cost record. Budgets support per provider/project, daily/monthly limits, approval thresholds, and unexpected-spend alerts. Zero paid-provider budget is the first-slice default.
