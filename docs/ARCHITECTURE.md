# Architecture Reference

Commands enter the API, authenticate the owner, evaluate policy, transact domain state and outbox events, then return a projection. A relay publishes events to Temporal dispatch/SSE projection consumers. Workers execute idempotent activities through provider adapters and return validated outputs; they do not write arbitrary UI state.

Business state lives in PostgreSQL. Temporal tracks orchestration durability. Redis is transport/runtime infrastructure. Frontend reads APIs and subscribes to SSE, then renders the server projection. Provider adapters return `available`, `unavailable`, or `blocked`; `unavailable` is a normal user-visible state.
