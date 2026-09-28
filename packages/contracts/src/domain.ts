export const operatingModes = ['manual', 'supervised', 'auto_pilot'] as const;
export type OperatingMode = (typeof operatingModes)[number];
export const agentStatuses = ['researching', 'analysing', 'designing', 'reviewing', 'coding', 'testing', 'waiting', 'deploying', 'monitoring', 'improving'] as const;
export type AgentStatus = (typeof agentStatuses)[number];
export const knowledgeKinds = ['official_source', 'established_principle', 'observed_pattern', 'project_finding', 'hypothesis', 'experiment', 'validated_learning', 'deprecated_learning'] as const;
export type KnowledgeKind = (typeof knowledgeKinds)[number];
export type RiskClass = 'routine' | 'consequential' | 'hard_gated';
export type ProviderAvailability = 'available' | 'unavailable' | 'blocked';

export interface EvidenceItem {
  id: string; sourceUrl: string; capturedAt: string; reference: string;
  locale: { language: string; market: string }; confidence: number;
  retention: 'active' | 'expired' | 'removed'; integrityHash: string;
}
export interface Opportunity {
  id: string; title: string; lifecycle: 'discovered' | 'researched' | 'scored' | 'rejected' | 'approved';
  evidenceIds: string[]; limitations: string[];
}
export interface EventEnvelope<T = Record<string, unknown>> {
  id: string; version: 1; type: string; aggregate: { type: string; id: string };
  correlationId: string; causationId?: string; actor: { type: 'owner' | 'agent' | 'system'; id: string };
  occurredAt: string; payload: T; evidenceIds: string[];
}
export interface ProviderResult<T> { availability: ProviderAvailability; value?: T; reason?: string }
