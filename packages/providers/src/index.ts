import type { ProviderResult } from '@venture/contracts';
export type ResearchEvidence = { url: string; reference: string; title: string; tags: string[]; metrics: Record<string, number>; capturedAt: string; confidence: number; limitations: string[] };
export interface PublicResearchSource { name: string; research(query: { language: string; market: string; seed?: string }): Promise<ProviderResult<ResearchEvidence[]>>; }
export interface LlmProvider { name: string; complete(input: { prompt: string }): Promise<ProviderResult<{ text: string }>>; }
export const unavailableLlm: LlmProvider = { name: 'unconfigured', async complete() { return { availability: 'unavailable', reason: 'No approved LLM provider is configured.' }; } };
export const unavailableResearch: PublicResearchSource = { name: 'unconfigured', async research() { return { availability: 'unavailable', reason: 'No approved public research source is configured.' }; } };
export { StackExchangeResearchSource } from './stack-exchange.js';
export { WikimediaPageviewsSource, type WikimediaTopic } from './wikimedia.js';
export { evidenceProviderManifests } from './capabilities.js';
