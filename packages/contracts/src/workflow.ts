import type { EvidenceItem, EventEnvelope, Opportunity } from './domain.js';
export type WorkflowState = 'created' | 'running' | 'paused' | 'awaiting_approval' | 'stopped' | 'completed' | 'failed';
export interface ResearchRun { id: string; state: WorkflowState; language: 'en'; market: 'global'; paidBudgetCents: 0; opportunities: Opportunity[]; events: EventEnvelope[] }
const transitions: Record<WorkflowState, readonly WorkflowState[]> = {
  created: ['running', 'stopped'], running: ['paused', 'awaiting_approval', 'failed', 'stopped'],
  paused: ['running', 'stopped'], awaiting_approval: ['completed', 'running', 'stopped'], stopped: [], completed: [], failed: []
};
export function canTransition(from: WorkflowState, to: WorkflowState): boolean {
  return transitions[from].includes(to);
}
export function assertEvidence(evidence: EvidenceItem): void {
  if (!evidence.sourceUrl || !evidence.reference || evidence.confidence < 0 || evidence.confidence > 1 || !evidence.integrityHash) throw new Error('Evidence is incomplete or invalid.');
}
export function canPresentCandidates(run: ResearchRun): boolean { return run.opportunities.filter((opportunity) => opportunity.evidenceIds.length > 0).length >= 3; }
