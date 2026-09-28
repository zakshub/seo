import type { OperatingMode, RiskClass } from './domain.js';

export type ActionKind = 'research.public_web' | 'project.create' | 'figma.write' | 'deployment.production' | 'dns.change' | 'domain.purchase' | 'paid.provider_call' | 'secret.access' | 'infrastructure.major_change';
export interface PolicyInput { mode: OperatingMode; action: ActionKind; risk: RiskClass; estimatedCostCents: number; remainingBudgetCents: number; explicitPermission: boolean; approvalId?: string }
export interface PolicyDecision { allowed: boolean; requiresApproval: boolean; reason: string }
const hardGated: ReadonlySet<ActionKind> = new Set(['deployment.production', 'dns.change', 'domain.purchase', 'paid.provider_call', 'secret.access', 'infrastructure.major_change']);
export function evaluatePolicy(input: PolicyInput): PolicyDecision {
  if (input.estimatedCostCents > input.remainingBudgetCents) return { allowed: false, requiresApproval: false, reason: 'Budget limit would be exceeded.' };
  if (hardGated.has(input.action)) return input.explicitPermission && Boolean(input.approvalId)
    ? { allowed: true, requiresApproval: true, reason: 'Hard-gated action has explicit scoped approval.' }
    : { allowed: false, requiresApproval: true, reason: 'This action is hard-gated in every operating mode.' };
  if (!input.explicitPermission) return { allowed: false, requiresApproval: false, reason: 'No permission grant allows this action.' };
  if (input.mode === 'manual' && input.risk === 'consequential' && !input.approvalId) return { allowed: false, requiresApproval: true, reason: 'Manual mode requires approval.' };
  if (input.mode === 'supervised' && input.risk === 'consequential' && !input.approvalId) return { allowed: false, requiresApproval: true, reason: 'Supervised mode requires approval for consequential work.' };
  return { allowed: true, requiresApproval: false, reason: 'Allowed by policy.' };
}
