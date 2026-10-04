import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Client, Connection } from '@temporalio/client';

type DispatchResult = { availability: 'available'; workflowId: string } | { availability: 'unavailable'; reason: string };

@Injectable()
export class TemporalService implements OnModuleDestroy {
  private connection?: Connection;
  async availability(): Promise<'available' | 'unavailable'> {
    try { const connection = await this.getConnection(); await connection.workflowService.getSystemInfo({}); return 'available'; }
    catch { return 'unavailable'; }
  }
  async dispatchResearch(runId:string,marketStudyId:string,brief:string,budget:{paidBudgetCents:number;budgetApprovalId?:string|undefined;braveMaxRequests:number}): Promise<DispatchResult> {
    try {
      const connection = await this.getConnection();
      const workflowId = `research-${runId}`;
      await new Client({ connection }).workflow.start('researchWorkflow', { taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? 'venture-research', workflowId, args: [{ runId, marketStudyId, brief, language:'en', market:'global', ...budget }] });
      return { availability: 'available', workflowId };
    } catch { return { availability: 'unavailable', reason: 'Temporal dispatch is unavailable. The persisted run can be retried after the worker runtime is restored.' }; }
  }
  async onModuleDestroy() { await this.connection?.close(); }
  private async getConnection() { if (!this.connection) this.connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS ?? '127.0.0.1:7233' }); return this.connection; }
}
