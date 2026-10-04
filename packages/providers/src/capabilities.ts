import type { EvidenceProviderManifest } from '@venture/contracts';

export const evidenceProviderManifests: EvidenceProviderManifest[] = [
  {
    id:'stackexchange-public-api', name:'Stack Exchange Webmasters API', capability:'problem_signal', sourceClass:'public_api',
    availability:'available', reason:'Official public API; supplies attributed Q&A engagement signals only.', requiresCredentials:false, paid:false,
    supportedLanguages:['en'], supportedMarkets:['global'], documentationUrl:'https://api.stackexchange.com/docs/advanced-search'
  },
  {
    id:'wikimedia-pageviews-api', name:'Wikimedia Pageviews API', capability:'topic_interest', sourceClass:'official',
    availability:'available', reason:'Official open API; article pageviews are directional topic interest, not search volume.', requiresCredentials:false, paid:false,
    supportedLanguages:['en','ur'], supportedMarkets:['global'], documentationUrl:'https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/page-views.html'
  },
  {
    id:'google-trends-api-alpha', name:'Google Trends API alpha', capability:'trend_interest', sourceClass:'official',
    availability:'unavailable', reason:'Access is limited to approved alpha testers; no verified access is configured.', requiresCredentials:true, paid:false,
    supportedLanguages:['multiple'], supportedMarkets:['multiple'], documentationUrl:'https://developers.google.com/search/apis/trends'
  },
  {
    id:'live-serp-provider', name:'Live SERP evidence', capability:'serp_observation', sourceClass:'public_api',
    availability:'unavailable', reason:'No approved, lawful, free live-SERP API is configured. Search-result scraping is not used as a fallback.', requiresCredentials:false, paid:false,
    supportedLanguages:[], supportedMarkets:[], documentationUrl:'https://developers.google.com/custom-search/v1/overview'
  },
  {
    id:'search-console-api', name:'Google Search Console API', capability:'first_party_search_performance', sourceClass:'first_party',
    availability:'unavailable', reason:'Requires owner OAuth and a verified site property; no public web property is connected.', requiresCredentials:true, paid:false,
    supportedLanguages:['property-dependent'], supportedMarkets:['property-dependent'], documentationUrl:'https://developers.google.com/webmaster-tools'
  },
  {
    id:'keyword-discovery-provider', name:'Search keyword discovery', capability:'keyword_discovery', sourceClass:'public_api',
    availability:'unavailable', reason:'No approved official keyword-demand API is configured. Public Q&A phrases remain problem-language observations only.', requiresCredentials:false, paid:false,
    supportedLanguages:[], supportedMarkets:[], documentationUrl:'https://developers.google.com/search/apis/trends'
  }
];
