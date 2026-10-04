import { describe, expect, it, vi } from 'vitest';
import { WikimediaPageviewsSource } from '../src/wikimedia.js';

describe('WikimediaPageviewsSource',()=>{
  it('records official topic-interest observations without relabeling them as search volume',async()=>{
    const fetcher=vi.fn(async()=>new Response(JSON.stringify({items:[{project:'en.wikipedia',article:'Search_engine_optimization',timestamp:'2026090100',views:120},{project:'en.wikipedia',article:'Search_engine_optimization',timestamp:'2026090200',views:80}]}),{status:200}));
    const source=new WikimediaPageviewsSource(fetcher as typeof fetch,()=>new Date('2026-10-04T00:00:00.000Z'));
    const result=await source.research([{article:'Search_engine_optimization',language:'en',label:'SEO'}]);
    expect(result.availability).toBe('available');
    expect(result.value?.[0]?.measurement).toMatchObject({kind:'wikipedia_article_pageviews_30d',value:200,unit:'pageviews',absoluteSearchDemand:false});
    expect(result.value?.[0]?.limitations.join(' ')).toContain('not Google search volume');
  });
  it('reports unavailable when no requested page can be observed',async()=>{
    const source=new WikimediaPageviewsSource(async()=>new Response('',{status:404}),()=>new Date('2026-10-04T00:00:00.000Z'));
    const result=await source.research([{article:'missing',language:'ur',label:'Missing'}]);
    expect(result.availability).toBe('unavailable');
    expect(result.reason).toContain('HTTP 404');
  });
});
