import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './research-activities.js';
// This activity may contain an explicitly approved billable SERP request. Keep automatic
// retries disabled until provider egress and persistence are split into separately durable steps.
const { performResearch } = proxyActivities<typeof activities>({ startToCloseTimeout: '90 seconds', retry: { maximumAttempts: 1 } });
export type ResearchWorkflowInput = { runId:string; marketStudyId:string; brief:string; language:'en'; market:'global'; paidBudgetCents:number; budgetApprovalId?:string|undefined; braveMaxRequests:number };
export async function researchWorkflow(input: ResearchWorkflowInput) { return performResearch(input); }
