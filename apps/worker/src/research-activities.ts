import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { unavailableResearch } from '@venture/providers';
import type { ResearchWorkflowInput } from './research-workflow.js';

export async function performResearch(input: ResearchWorkflowInput) {
  const result = await unavailableResearch.research({ language: input.language, market: input.market });
  const state = result.availability === 'available' ? 'researching' : 'waiting';
  const eventType = result.availability === 'available' ? 'agent.status_changed' : 'provider.unavailable';
  const payload = result.availability === 'available'
    ? { agent: 'opportunity-researcher', status: 'researching', provider: unavailableResearch.name }
    : { provider: unavailableResearch.name, capability: 'public-research', reason: result.reason ?? 'Provider configuration is required.' };
  const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? 'postgresql://venture:venture@127.0.0.1:5432/venture_os' });
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query('update workflow_runs set state=$2,updated_at=now() where id=$1', [input.runId,state]);
    await client.query(`insert into outbox_events(id,aggregate_type,aggregate_id,event_type,event_version,payload,occurred_at) values($1,'workflow',$2,$3,1,$4::jsonb,now())`, [randomUUID(),input.runId,eventType,JSON.stringify(payload)]);
    await client.query('commit');
  } catch (error) { await client.query('rollback'); throw error; } finally { client.release(); await pool.end(); }
  return { state, providerAvailability: result.availability };
}
