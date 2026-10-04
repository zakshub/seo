# Security, Cost, and Governance

Secrets use environment variables locally and a secret-manager reference in production. Redaction applies before events, audit details, errors, and frontend responses. Audit logs are append-only and record actor, policy decision, target, before/after references, and correlation ID.

Every billable/provider action requires capability permission, budget check, estimate, and cost record. Budgets support per provider/project, daily/monthly limits, approval thresholds, and unexpected-spend alerts. Zero paid-provider budget is the first-slice default.

For Brave SERP evidence, the runtime requires four independent local settings: credential, approval reference, approved cents and maximum requests. The worker projects cost in micro-USD before egress and refuses the whole batch if either request or money scope would be exceeded. Adding a credential alone never authorizes a request. Raw responses exclude request authorization headers; activity events contain only sanitized outcomes. Rate limits persist with the provider retry delay and do not trigger an unbounded retry loop. The combined research activity has one Temporal attempt while billable egress remains inside it, preventing a database failure from silently repeating paid requests; a later refactor may restore retries only after egress and persistence are separately durable.
