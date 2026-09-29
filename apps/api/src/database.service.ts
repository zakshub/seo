import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';

const OWNER_ID = '00000000-0000-4000-8000-000000000001';
const WORKSPACE_ID = '00000000-0000-4000-8000-000000000002';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool = new Pool({ connectionString: process.env.DATABASE_URL ?? 'postgresql://venture:venture@127.0.0.1:5432/venture_os' });
  async onModuleDestroy() { await this.pool.end(); }
  async health() { const result = await this.pool.query<{ now: string }>('select now()::text as now'); return result.rows[0]?.now; }
  async overview() {
    const result = await this.pool.query(`select
      (select count(*)::int from workflow_runs) as workflows,
      (select count(*)::int from opportunities) as opportunities,
      (select count(*)::int from projects) as projects,
      (select count(*)::int from approval_requests where state = 'pending') as approvals`);
    return result.rows[0];
  }
  async activity() {
    const [runs, events] = await Promise.all([
      this.pool.query('select id,state,temporal_workflow_id as "temporalWorkflowId",created_at as "createdAt",updated_at as "updatedAt" from workflow_runs order by created_at desc limit 10'),
      this.pool.query('select id,event_type as "eventType",aggregate_id as "aggregateId",payload,occurred_at as "occurredAt" from outbox_events order by occurred_at desc,id desc limit 25')
    ]);
    return { runs: runs.rows, events: events.rows };
  }
  async opportunities() {
    const result = await this.pool.query(`select o.id,o.title,o.lifecycle,o.rationale,o.scorecard,o.limitations,o.created_at as "createdAt",
      (select ar.id from approval_requests ar where ar.workflow_run_id=o.workflow_run_id and ar.state='pending' order by ar.created_at desc limit 1) as "approvalId",
      coalesce(json_agg(json_build_object('id',e.id,'sourceUrl',e.source_url,'capturedAt',e.captured_at,'reference',e.reference,'confidence',e.confidence)) filter (where e.id is not null),'[]') as evidence
      from opportunities o left join opportunity_evidence oe on oe.opportunity_id=o.id left join evidence_items e on e.id=oe.evidence_id
      group by o.id order by (o.scorecard->>'total')::int desc nulls last,o.created_at desc limit 25`);
    return result.rows;
  }
  async approvals() {
    const result = await this.pool.query(`select id,workflow_run_id as "workflowRunId",action,input_snapshot as "inputSnapshot",state,expires_at as "expiresAt",created_at as "createdAt" from approval_requests order by created_at desc limit 25`);
    return result.rows;
  }
  async decideApproval(id: string, decision: 'approve'|'reject'|'request_changes', opportunityId: string, note?: string) {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      const approval = await client.query<{ workflowRunId:string; workspaceId:string; inputSnapshot:{candidateIds?:string[]} }>(`select workflow_run_id as "workflowRunId",workspace_id as "workspaceId",input_snapshot as "inputSnapshot" from approval_requests where id=$1 and state='pending' for update`,[id]);
      const row=approval.rows[0];
      if (!row) throw new Error('Approval is not pending or does not exist.');
      if (!row.inputSnapshot.candidateIds?.includes(opportunityId)) throw new Error('Selected opportunity is not part of this approval request.');
      const approvalState=decision==='approve'?'approved':decision==='reject'?'rejected':'changes_requested';
      await client.query('update approval_requests set state=$2 where id=$1',[id,approvalState]);
      await client.query(`insert into outbox_events(id,aggregate_type,aggregate_id,event_type,event_version,payload,occurred_at) values($1,'approval',$2,'approval.decided',1,$3::jsonb,now())`,[randomUUID(),id,JSON.stringify({decision,opportunityId,note:note?.slice(0,500)})]);
      if (decision==='approve') {
        const projectId=randomUUID();
        await client.query(`update opportunities set lifecycle=case when id=$1 then 'approved' else 'rejected' end where workflow_run_id=$2`,[opportunityId,row.workflowRunId]);
        await client.query(`insert into projects(id,workspace_id,opportunity_id,state) values($1,$2,$3,'design_preparation_queued') on conflict(opportunity_id) do nothing`,[projectId,row.workspaceId,opportunityId]);
        await client.query(`update workflow_runs set state='completed',updated_at=now() where id=$1`,[row.workflowRunId]);
        await client.query(`insert into outbox_events(id,aggregate_type,aggregate_id,event_type,event_version,payload,occurred_at) values($1,'project',$2,'project.created',1,$3::jsonb,now()),($4,'project',$2,'design.preparation_queued',1,$5::jsonb,now())`,[randomUUID(),projectId,JSON.stringify({opportunityId,approvalId:id}),randomUUID(),JSON.stringify({projectId,figma:'unavailable',reason:'Figma integration is deferred until Phase 4 access verification.'})]);
        await client.query('commit'); return { approvalId:id,decision,projectId,state:'design_preparation_queued' };
      }
      await client.query(`update opportunities set lifecycle=$2 where id=$1`,[opportunityId,decision==='reject'?'rejected':'researched']);
      await client.query(`update workflow_runs set state=$2,updated_at=now() where id=$1`,[row.workflowRunId,decision==='reject'?'stopped':'running']);
      await client.query('commit'); return { approvalId:id,decision,state:approvalState };
    } catch(error) { await client.query('rollback'); throw error; } finally { client.release(); }
  }
  async workflow(id: string) {
    const result = await this.pool.query('select id,state,temporal_workflow_id as "temporalWorkflowId",created_at as "createdAt",updated_at as "updatedAt" from workflow_runs where id=$1', [id]);
    return result.rows[0];
  }
  async markDispatched(id: string, temporalWorkflowId: string) { await this.transition(id, 'queued', 'workflow.dispatched', { temporalWorkflowId }, temporalWorkflowId); }
  async markDispatchUnavailable(id: string, reason: string) { await this.transition(id, 'waiting', 'workflow.dispatch_unavailable', { reason }); }
  async startResearch(idempotencyKey: string) {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      await client.query(`insert into workspaces(id, owner_id, name) values ($1,$2,'Owner Workspace') on conflict (id) do nothing`, [WORKSPACE_ID, OWNER_ID]);
      const existing = await client.query<{ id:string; state:string }>('select id,state from workflow_runs where workspace_id=$1 and idempotency_key=$2', [WORKSPACE_ID,idempotencyKey]);
      if (existing.rows[0]) { await client.query('commit'); return { ...existing.rows[0], idempotent: true }; }
      const runId = randomUUID(); const eventId = randomUUID(); const now = new Date().toISOString();
      await client.query(`insert into workflow_runs(id,workspace_id,idempotency_key,state) values($1,$2,$3,'created')`, [runId,WORKSPACE_ID,idempotencyKey]);
      await client.query(`insert into outbox_events(id,aggregate_type,aggregate_id,event_type,event_version,payload,occurred_at) values($1,'workflow',$2,'workflow.created',1,$3::jsonb,$4)`, [eventId,runId,JSON.stringify({ language:'en', market:'global', paidBudgetCents:0 }),now]);
      await client.query('commit'); return { id: runId, state: 'created', idempotent: false };
    } catch (error) { await client.query('rollback'); throw error; } finally { client.release(); }
  }
  private async transition(id: string, state: string, eventType: string, payload: object, temporalWorkflowId?: string) {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      await client.query(`update workflow_runs set
        state=case when state='created' then $2 else state end,
        temporal_workflow_id=coalesce($3,temporal_workflow_id),updated_at=now()
        where id=$1`, [id,state,temporalWorkflowId ?? null]);
      await client.query(`insert into outbox_events(id,aggregate_type,aggregate_id,event_type,event_version,payload,occurred_at) values($1,'workflow',$2,$3,1,$4::jsonb,now())`, [randomUUID(),id,eventType,JSON.stringify(payload)]);
      await client.query('commit');
    } catch (error) { await client.query('rollback'); throw error; } finally { client.release(); }
  }
}
