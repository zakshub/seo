import { describe, expect, it } from 'vitest';
import { evaluatePolicy } from '../src/policy.js';
import { assertEvidence, canPresentCandidates, canTransition } from '../src/workflow.js';

describe('operating policy', () => {
  it('never allows DNS changes without explicit approval even in Auto Pilot', () => expect(evaluatePolicy({ mode: 'auto_pilot', action: 'dns.change', risk: 'hard_gated', estimatedCostCents: 0, remainingBudgetCents: 1, explicitPermission: true })).toMatchObject({ allowed: false, requiresApproval: true }));
  it('refuses unexpected spend', () => expect(evaluatePolicy({ mode: 'auto_pilot', action: 'paid.provider_call', risk: 'hard_gated', estimatedCostCents: 101, remainingBudgetCents: 100, explicitPermission: true, approvalId: 'a' })).toMatchObject({ allowed: false }));
  it('requires manual approval for consequential actions', () => expect(evaluatePolicy({ mode: 'manual', action: 'project.create', risk: 'consequential', estimatedCostCents: 0, remainingBudgetCents: 0, explicitPermission: true })).toMatchObject({ allowed: false, requiresApproval: true }));
});
describe('workflow invariants', () => {
  it('has safe transitions', () => { expect(canTransition('running', 'paused')).toBe(true); expect(canTransition('completed', 'running')).toBe(false); });
  it('requires complete evidence', () => expect(() => assertEvidence({ id: 'e', sourceUrl: '', capturedAt: '', reference: '', locale: { language: 'en', market: 'global' }, confidence: 2, retention: 'active', integrityHash: '' })).toThrow());
  it('requires three evidenced opportunities', () => expect(canPresentCandidates({ id: 'r', state: 'running', language: 'en', market: 'global', paidBudgetCents: 0, events: [], opportunities: [{ id: '1', title: '', lifecycle: 'discovered', evidenceIds: ['e'], limitations: [] }, { id: '2', title: '', lifecycle: 'discovered', evidenceIds: ['e'], limitations: [] }] })).toBe(false));
});
