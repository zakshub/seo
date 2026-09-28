# ADR 0002: PostgreSQL plus transactional outbox

Status: Accepted. PostgreSQL is authoritative business storage. State and outbox writes share one transaction, avoiding UI events for changes that did not commit. Consumers are at-least-once and idempotent.
