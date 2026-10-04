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
    const result = await this.pool.query(`select o.id,o.market_study_id as "marketStudyId",o.title,o.lifecycle,o.rationale,o.scorecard,o.limitations,o.problem,o.audience,
      o.search_demand_hypothesis as "searchDemandHypothesis",o.search_intent as "searchIntent",o.search_surfaces as "searchSurfaces",
      o.geography_language as "geographyLanguage",o.product_type_hypothesis as "productTypeHypothesis",o.monetization_hypothesis as "monetizationHypothesis",
      o.traffic_potential as "trafficPotential",o.build_complexity as "buildComplexity",o.defensibility,o.risks,o.unknowns,o.confidence,o.recommendation,o.created_at as "createdAt",
      (select ar.id from approval_requests ar where ar.workflow_run_id=o.workflow_run_id and ar.state='pending' order by ar.created_at desc limit 1) as "approvalId",
      coalesce(json_agg(json_build_object('id',e.id,'sourceUrl',e.source_url,'capturedAt',e.captured_at,'reference',e.reference,'confidence',e.confidence)) filter (where e.id is not null),'[]') as evidence
      from opportunities o left join opportunity_evidence oe on oe.opportunity_id=o.id left join evidence_items e on e.id=oe.evidence_id
      group by o.id order by (o.market_study_id is not null) desc,o.created_at desc,(o.scorecard->>'total')::int desc nulls last limit 25`);
    return result.rows;
  }
  async approvals() {
    const result = await this.pool.query(`select id,workflow_run_id as "workflowRunId",action,input_snapshot as "inputSnapshot",state,expires_at as "expiresAt",created_at as "createdAt" from approval_requests order by created_at desc limit 25`);
    return result.rows;
  }
  async marketStudies() {
    const studies = await this.pool.query(`select ms.id,ms.brief,ms.language,ms.market,ms.status,ms.source_policy as "sourcePolicy",ms.paid_budget_cents as "paidBudgetCents",
      ms.request_limit as "requestLimit",ms.time_limit_seconds as "timeLimitSeconds",ms.created_at as "createdAt",ms.updated_at as "updatedAt",
      wr.id as "workflowRunId",wr.state as "workflowState"
      from market_studies ms left join lateral (select id,state from workflow_runs where market_study_id=ms.id order by created_at desc limit 1) wr on true
      order by ms.created_at desc limit 20`);
    if (!studies.rows.length) return [];
    const ids=studies.rows.map((row:{id:string})=>row.id);
    const [opportunities,findings,evidence] = await Promise.all([
      this.pool.query(`select id,market_study_id as "marketStudyId",title,rationale,scorecard,recommendation,confidence,unknowns,problem,audience,
        search_demand_hypothesis as "searchDemandHypothesis",search_intent as "searchIntent",product_type_hypothesis as "productTypeHypothesis",
        monetization_hypothesis as "monetizationHypothesis",traffic_potential as "trafficPotential",build_complexity as "buildComplexity",defensibility,risks
        from opportunities where market_study_id=any($1::uuid[]) order by (scorecard->>'total')::int desc`,[ids]),
      this.pool.query(`select id,market_study_id as "marketStudyId",opportunity_id as "opportunityId",dimension,classification,claim,evidence_ids as "evidenceIds",confidence
        from market_findings where market_study_id=any($1::uuid[]) order by created_at`,[ids]),
      this.pool.query(`select oe.opportunity_id as "opportunityId",e.id,e.source_url as "sourceUrl",e.captured_at as "capturedAt",e.reference,e.confidence
        from opportunity_evidence oe join evidence_items e on e.id=oe.evidence_id join opportunities o on o.id=oe.opportunity_id
        where o.market_study_id=any($1::uuid[])`,[ids])
    ]);
    return studies.rows.map((study:{id:string})=>({
      ...study,
      opportunities:opportunities.rows.filter((item:{marketStudyId:string})=>item.marketStudyId===study.id).map((item:{id:string})=>({
        ...item,
        findings:findings.rows.filter((finding:{opportunityId?:string})=>finding.opportunityId===item.id),
        evidence:evidence.rows.filter((entry:{opportunityId:string})=>entry.opportunityId===item.id)
      }))
    }));
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
        await client.query(`update market_studies set status='completed',updated_at=now() where id=(select market_study_id from workflow_runs where id=$1)`,[row.workflowRunId]);
        await client.query(`insert into outbox_events(id,aggregate_type,aggregate_id,event_type,event_version,payload,occurred_at) values($1,'project',$2,'project.created',1,$3::jsonb,now()),($4,'project',$2,'design.preparation_queued',1,$5::jsonb,now())`,[randomUUID(),projectId,JSON.stringify({opportunityId,approvalId:id}),randomUUID(),JSON.stringify({projectId,figma:'unavailable',reason:'Figma integration is deferred until Phase 4 access verification.'})]);
        await client.query('commit'); return { approvalId:id,decision,projectId,state:'design_preparation_queued' };
      }
      await client.query(`update opportunities set lifecycle=$2 where id=$1`,[opportunityId,decision==='reject'?'rejected':'researched']);
      await client.query(`update workflow_runs set state=$2,updated_at=now() where id=$1`,[row.workflowRunId,decision==='reject'?'stopped':'running']);
      await client.query(`update market_studies set status=$2,updated_at=now() where id=(select market_study_id from workflow_runs where id=$1)`,[row.workflowRunId,decision==='reject'?'stopped':'researching']);
      await client.query('commit'); return { approvalId:id,decision,state:approvalState };
    } catch(error) { await client.query('rollback'); throw error; } finally { client.release(); }
  }
  async workflow(id: string) {
    const result = await this.pool.query('select id,market_study_id as "marketStudyId",state,temporal_workflow_id as "temporalWorkflowId",created_at as "createdAt",updated_at as "updatedAt" from workflow_runs where id=$1', [id]);
    return result.rows[0];
  }
  async markDispatched(id: string, temporalWorkflowId: string) { await this.transition(id, 'queued', 'workflow.dispatched', { temporalWorkflowId }, temporalWorkflowId); }
  async markDispatchUnavailable(id: string, reason: string) { await this.transition(id, 'waiting', 'workflow.dispatch_unavailable', { reason }); }
  async startResearch(idempotencyKey: string, brief: string) {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      await client.query(`insert into workspaces(id, owner_id, name) values ($1,$2,'Owner Workspace') on conflict (id) do nothing`, [WORKSPACE_ID, OWNER_ID]);
      const existing = await client.query<{ id:string; state:string; marketStudyId:string }>('select id,state,market_study_id as "marketStudyId" from workflow_runs where workspace_id=$1 and idempotency_key=$2', [WORKSPACE_ID,idempotencyKey]);
      if (existing.rows[0]) { await client.query('commit'); return { ...existing.rows[0], idempotent: true }; }
      const runId = randomUUID(); const studyId=randomUUID(); const eventId = randomUUID(); const now = new Date().toISOString();
      await client.query(`insert into market_studies(id,workspace_id,brief,language,market,status,source_policy,paid_budget_cents,request_limit,time_limit_seconds)
        values($1,$2,$3,'en','global','created','free_public_web',0,1,30)`,[studyId,WORKSPACE_ID,brief]);
      await client.query(`insert into workflow_runs(id,workspace_id,market_study_id,idempotency_key,state) values($1,$2,$3,$4,'created')`, [runId,WORKSPACE_ID,studyId,idempotencyKey]);
      await client.query(`insert into outbox_events(id,aggregate_type,aggregate_id,event_type,event_version,payload,occurred_at) values
        ($1,'market_study',$2,'market_study.created',1,$3::jsonb,$4),($5,'workflow',$6,'workflow.created',1,$7::jsonb,$4)`,
        [randomUUID(),studyId,JSON.stringify({brief,language:'en',market:'global',sourcePolicy:'free_public_web',paidBudgetCents:0,requestLimit:1,timeLimitSeconds:30}),now,eventId,runId,JSON.stringify({marketStudyId:studyId,language:'en',market:'global',paidBudgetCents:0})]);
      await client.query('commit'); return { id: runId, marketStudyId:studyId, state: 'created', idempotent: false };
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
