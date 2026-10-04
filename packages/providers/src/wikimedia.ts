import type { MarketEvidenceObservation, ProviderResult } from '@venture/contracts';

type FetchLike = typeof fetch;
type PageviewResponse = { items?: Array<{ project?:string; article?:string; timestamp?:string; views?:number }> };
export type WikimediaTopic = { article: string; language: 'en' | 'ur'; label: string };

const BASE = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article';
const LIMITS = [
  'Wikipedia article pageviews are a directional topic-interest signal, not Google search volume, ranking difficulty, click potential, or commercial demand.',
  'A pageview may originate from navigation, links, social referrals, direct visits, or search; source attribution is unavailable here.'
];

function ymd(date: Date) { return date.toISOString().slice(0,10).replaceAll('-',''); }

export class WikimediaPageviewsSource {
  readonly name = 'wikimedia-pageviews-api';
  constructor(private readonly fetcher: FetchLike = fetch, private readonly now: () => Date = () => new Date()) {}

  async research(topics: WikimediaTopic[]): Promise<ProviderResult<MarketEvidenceObservation[]>> {
    const end = this.now();
    const start = new Date(end.getTime() - 29 * 86400000);
    const observations: MarketEvidenceObservation[] = [];
    const failures: string[] = [];
    for (const topic of topics) {
      const project = `${topic.language}.wikipedia.org`;
      const path = `${project}/all-access/user/${encodeURIComponent(topic.article)}/daily/${ymd(start)}/${ymd(end)}`;
      const url = `${BASE}/${path}`;
      try {
        const response = await this.fetcher(url,{headers:{accept:'application/json','user-agent':'AutonomousWebVentureOS/0.2 (market evidence; contact via repository)'},signal:AbortSignal.timeout(15000)});
        if (!response.ok) { failures.push(`${topic.label} (${topic.language}): HTTP ${response.status}`); continue; }
        const body = await response.json() as PageviewResponse;
        const items = (body.items ?? []).filter((item) => typeof item.views === 'number');
        if (!items.length) { failures.push(`${topic.label} (${topic.language}): no observations`); continue; }
        const total = items.reduce((sum,item)=>sum+(item.views ?? 0),0);
        observations.push({
          providerId:this.name, capability:'topic_interest', sourceClass:'official', sourceUrl:`https://${project}/wiki/${encodeURIComponent(topic.article)}`,
          subject:topic.label, capturedAt:this.now().toISOString(), observedAt:end.toISOString(), freshUntil:new Date(end.getTime()+7*86400000).toISOString(), language:topic.language, market:'global',evidenceNature:'proxy',
          measurement:{kind:'wikipedia_article_pageviews_30d',value:total,unit:'pageviews',definition:`Sum of ${items.length} daily Wikimedia user pageview observations.`,absoluteSearchDemand:false},
          confidence:0.7, limitations:LIMITS, reference:JSON.stringify({provider:this.name,api:BASE,project,article:topic.article,start:ymd(start),end:ymd(end),days:items.length,failures})
        });
      } catch (error) { failures.push(`${topic.label} (${topic.language}): ${error instanceof Error?error.message:'network failure'}`); }
    }
    if (!observations.length) return {availability:'unavailable',reason:`Wikimedia returned no usable observations. ${failures.join('; ')}`};
    return failures.length
      ? {availability:'available',value:observations,reason:`Partial result: ${failures.join('; ')}`}
      : {availability:'available',value:observations};
  }
}
