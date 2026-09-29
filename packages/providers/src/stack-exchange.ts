import type { PublicResearchSource, ResearchEvidence } from './index.js';

type FetchLike = typeof fetch;
type Question = { title?: string; link?: string; tags?: string[]; score?: number; view_count?: number; answer_count?: number; is_answered?: boolean; creation_date?: number };
type Wrapper = { items?: Question[]; backoff?: number; quota_remaining?: number; error_name?: string; error_message?: string };

const API = 'https://api.stackexchange.com/2.3/questions';
const LIMITATION = 'Stack Overflow engagement is a developer problem-demand signal, not proof of Google search volume, SERP weakness, or commercial demand.';

function decode(value: string) {
  return value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

export class StackExchangeResearchSource implements PublicResearchSource {
  readonly name = 'stackexchange-public-api';
  constructor(private readonly fetcher: FetchLike = fetch, private readonly now: () => Date = () => new Date()) {}
  async research(query: { language: string; market: string; seed?: string }) {
    if (query.language !== 'en' || query.market !== 'global') return { availability: 'blocked' as const, reason: 'This adapter is approved only for English/global research.' };
    const capturedAt = this.now().toISOString();
    const fromdate = Math.floor((this.now().getTime() - 30 * 86400000) / 1000);
    const url = new URL(API);
    url.search = new URLSearchParams({ site: 'stackoverflow', order: 'desc', sort: 'votes', pagesize: '30', fromdate: String(fromdate) }).toString();
    try {
      const response = await this.fetcher(url, { headers: { accept: 'application/json', 'user-agent': 'AutonomousWebVentureOS/0.1 (research; source attribution retained)' }, signal: AbortSignal.timeout(15000) });
      if (!response.ok) return { availability: 'unavailable' as const, reason: `Stack Exchange API returned HTTP ${response.status}.` };
      const body = await response.json() as Wrapper;
      if (body.error_name) return { availability: 'unavailable' as const, reason: `Stack Exchange API error: ${body.error_name}.` };
      if (body.backoff && !(body.items?.length)) return { availability: 'blocked' as const, reason: `Stack Exchange requested a ${body.backoff} second backoff.` };
      const evidence: ResearchEvidence[] = (body.items ?? []).filter((item): item is Required<Pick<Question,'title'|'link'|'tags'>> & Question => Boolean(item.title && item.link && item.tags?.length)).map(item => ({
        url: item.link,
        title: decode(item.title),
        tags: item.tags,
        capturedAt,
        confidence: 0.55,
        metrics: { views: item.view_count ?? 0, score: item.score ?? 0, answers: item.answer_count ?? 0, answered: item.is_answered ? 1 : 0, quotaRemaining: body.quota_remaining ?? -1, backoffSeconds: body.backoff ?? 0 },
        reference: JSON.stringify({ provider: this.name, endpoint: API, questionTitle: decode(item.title), tags: item.tags, capturedAt }),
        limitations: [LIMITATION]
      }));
      return evidence.length ? { availability: 'available' as const, value: evidence } : { availability: 'unavailable' as const, reason: 'Stack Exchange returned no usable questions for the approved query.' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown network failure';
      return { availability: 'unavailable' as const, reason: `Stack Exchange request failed: ${message}` };
    }
  }
}
