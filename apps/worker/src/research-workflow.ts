import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './research-activities.js';
const { performResearch } = proxyActivities<typeof activities>({ startToCloseTimeout: '30 seconds', retry: { maximumAttempts: 3 } });
export type ResearchWorkflowInput = { runId: string; marketStudyId: string; brief: string; language: 'en'; market: 'global' };
export async function researchWorkflow(input: ResearchWorkflowInput) { return performResearch(input); }
