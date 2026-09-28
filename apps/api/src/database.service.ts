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
}
