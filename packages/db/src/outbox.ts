import type { EventEnvelope } from '@venture/contracts';

/** Persistence boundary: implementations must insert domain state and this record in one SQL transaction. */
export interface OutboxRecord { id: string; event: EventEnvelope; createdAt: string; publishedAt: string | null }
export interface TransactionalStore {
  transaction<T>(operation: (tx: { insertOutbox(event: EventEnvelope): Promise<void> }) => Promise<T>): Promise<T>;
}
export async function persistWithEvent<T>(store: TransactionalStore, event: EventEnvelope, operation: (tx: { insertOutbox(event: EventEnvelope): Promise<void> }) => Promise<T>): Promise<T> {
  return store.transaction(async (tx) => { const result = await operation(tx); await tx.insertOutbox(event); return result; });
}
