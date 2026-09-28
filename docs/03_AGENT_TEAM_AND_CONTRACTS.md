# Agent Team and Contracts

The ten roles are Chief Intelligence, Opportunity and SEO Researcher, Product Strategist, UX/UI Designer, Design Reviewer, Software Engineer, QA/Technical SEO Engineer, DevOps/Deployment, Growth SEO, and Monetization/Business Performance. Roles describe accountable capabilities, not independent unrestricted identities.

An agent contract declares accepted command schemas, produced events, required evidence, allowed provider capabilities, idempotency key, estimated/actual cost reporting, retry behavior, output validation, and escalation conditions. Chief Intelligence can create tasks and approval requests but never executes a restricted action directly. Agent status values (`researching`, `analysing`, `designing`, `reviewing`, `coding`, `testing`, `waiting`, `deploying`, `monitoring`, `improving`) are derived from live AgentRun state and events.

The first slice implements only research orchestration and strategy evaluation contracts. Other agents are declared unavailable rather than cosmetically active.
