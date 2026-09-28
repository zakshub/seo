# Integrations and Infrastructure

Integrations are capability adapters: research sources, LLMs, GitHub, Figma, analytics/Search Console, deployment/Hostinger, and secrets. They must support availability discovery and may not be coupled to agents. Credentials are references in a secret manager, never stored as connection values.

Figma is deferred to Phase 4. The supplied Figma file is the canonical design workspace once access is verified. `zakshub/designer` will be integrated through a version-pinned adapter after license/security review. Hostinger and domain deployment abstractions are prepared only; production deployment remains approval-gated.
