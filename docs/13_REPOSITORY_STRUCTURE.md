# Repository Structure

`apps/` holds independently runnable UI/API/worker services. `packages/` holds contracts, database access, UI, and providers. `infrastructure/` describes local and eventual runtime topology. `docs/` stores specifications and ADRs. `tests/` contains cross-service tests. `scripts/` is introduced only for repeatable operational tasks. `brain/` is not a general note dump; persisted knowledge lives in the database, while this repository stores schemas and governance.

Folders are created only as a service or shared concern is implemented.
