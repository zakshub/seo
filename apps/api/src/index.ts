import { evaluatePolicy, type PolicyInput } from '@venture/contracts';
/** NestJS transport layer will call this application boundary; policy stays transport-independent. */
export function authorizeCommand(input: PolicyInput) { return evaluatePolicy(input); }
export const openApiSummary = { title: 'Venture OS API', version: '0.1.0', activityTransport: 'SSE persisted-event projection' };
