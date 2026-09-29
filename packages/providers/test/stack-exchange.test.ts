import { describe, expect, it, vi } from 'vitest';
import { StackExchangeResearchSource } from '../src/stack-exchange.js';

describe('StackExchangeResearchSource', () => {
  it('maps attributed public API results without claiming search volume', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ quota_remaining:9999, backoff:10, items:[{ title:'How to test &amp; deploy?', link:'https://stackoverflow.com/q/1', tags:['testing'], score:12, view_count:3400, answer_count:1, is_answered:true }] }),{status:200}));
    const source = new StackExchangeResearchSource(fetcher as typeof fetch,()=>new Date('2026-09-29T00:00:00.000Z'));
    const result = await source.research({language:'en',market:'global'});
    expect(result.availability).toBe('available');
    expect(result.value?.[0]).toMatchObject({ title:'How to test & deploy?', url:'https://stackoverflow.com/q/1', confidence:0.55, metrics:{views:3400,quotaRemaining:9999,backoffSeconds:10} });
    expect(result.value?.[0]?.limitations[0]).toContain('not proof of Google search volume');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('reports upstream failure instead of inventing evidence', async () => {
    const source = new StackExchangeResearchSource(async()=>new Response('',{status:503}),()=>new Date());
    await expect(source.research({language:'en',market:'global'})).resolves.toEqual({availability:'unavailable',reason:'Stack Exchange API returned HTTP 503.'});
  });
});
