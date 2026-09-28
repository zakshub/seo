# Data, Event, and Memory Model

Core entities are Owner/Workspace, OperatingPolicy, Budget, PermissionGrant, WorkflowRun, WorkflowStep, AgentRun, Opportunity, EvidenceItem, Evaluation, Project, ApprovalRequest/Decision, ActivityEvent, ProviderConnection, CostLedgerEntry, KnowledgeRecord, Experiment, and AuditLog.

Evidence records source URL or provider, captured time, extraction/reference, applicable locale, confidence, retention disposition, and content integrity metadata. Events use a versioned envelope containing ID, type, aggregate, correlation/workflow/agent IDs, causation ID, actor, occurred-at, sanitized payload, and evidence references. See `DATA_MODEL.md` and `EVENT_MODEL.md` for fields and invariants.
