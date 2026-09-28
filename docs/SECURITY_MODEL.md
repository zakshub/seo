# Security Model

The first slice is local single-owner authentication with password-derived credentials stored outside tracked source. Session cookies are secure/httpOnly in deployed environments. Authorization is command-level policy evaluation, not UI visibility. Secrets cannot enter domain events, activity streams, error messages, or documentation.

Risk classifications and hard gates apply server-side. Audit logs are append-only. Provider calls use minimum scope and explicit connection status. Dependency and license review is required before using `zakshub/designer` or any new provider SDK.
