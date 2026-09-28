import { canPresentCandidates, type Opportunity } from '@venture/contracts';
import type { PublicResearchSource } from '@venture/providers';
export async function collectResearch(source: PublicResearchSource, query: { language: string; market: string }): Promise<{ status: 'unavailable' | 'incomplete' | 'ready'; reason?: string }> {
  const result = await source.research(query);
  if (result.availability !== 'available') return result.reason
    ? { status: 'unavailable', reason: result.reason }
    : { status: 'unavailable' };
  return { status: 'incomplete', reason: 'Source evidence must be persisted and validated before candidate evaluation.' };
}
export function candidatesReady(opportunities: Opportunity[]): boolean { return canPresentCandidates({ id: 'validation', state: 'running', language: 'en', market: 'global', paidBudgetCents: 0, events: [], opportunities }); }
