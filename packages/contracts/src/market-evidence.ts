import type { ProviderAvailability } from './domain.js';

export const evidenceCapabilities = [
  'problem_signal', 'topic_interest', 'trend_interest', 'keyword_discovery',
  'search_demand', 'serp_observation', 'competitor_observation', 'commercial_intent',
  'geographic_market_context', 'click_potential', 'authority_difficulty', 'first_party_search_performance'
] as const;
export type EvidenceCapability = (typeof evidenceCapabilities)[number];
export type EvidenceSourceClass = 'official' | 'first_party' | 'public_api' | 'open_dataset' | 'open_source';
export type EvidenceNature = 'direct' | 'proxy';

export interface EvidenceProviderManifest {
  id: string;
  name: string;
  capability: EvidenceCapability;
  sourceClass: EvidenceSourceClass;
  availability: ProviderAvailability;
  reason: string;
  requiresCredentials: boolean;
  paid: boolean;
  supportedLanguages: string[];
  supportedMarkets: string[];
  documentationUrl: string;
  evidenceNature: EvidenceNature;
  resolvesDimensions: string[];
  limitations: string[];
}

export interface MarketEvidenceObservation {
  providerId: string;
  capability: EvidenceCapability;
  sourceClass: EvidenceSourceClass;
  sourceUrl: string;
  subject: string;
  capturedAt: string;
  language: string;
  market: string;
  geography?: string;
  evidenceNature: EvidenceNature;
  observedAt: string;
  freshUntil?: string;
  measurement: {
    kind: string;
    value: number | null;
    unit: string;
    definition: string;
    absoluteSearchDemand: false;
  };
  confidence: number;
  limitations: string[];
  reference: string;
}

export const modernOpportunityDimensions = [
  'demand', 'intent', 'serp_reality', 'competitor_quality', 'content_product_gap',
  'topic_traffic_potential', 'click_potential', 'solution_fit', 'authority_requirement',
  'build_feasibility', 'strategic_value'
] as const;
export type ModernOpportunityDimension = (typeof modernOpportunityDimensions)[number];

export interface ModernDimensionAssessment {
  dimension: ModernOpportunityDimension;
  classification: 'fact' | 'observation' | 'inference' | 'unknown';
  claim: string;
  evidenceIds: string[];
  strength: number | null;
  confidence?: number;
  freshUntil?: string;
  polarity?: 'supports' | 'contradicts' | 'neutral';
}

const modernWeights: Record<ModernOpportunityDimension, number> = {
  demand: 13, intent: 10, serp_reality: 12, competitor_quality: 8,
  content_product_gap: 12, topic_traffic_potential: 10, click_potential: 8,
  solution_fit: 8, authority_requirement: 6, build_feasibility: 7, strategic_value: 6
};

export interface ModernOpportunityScore {
  total: number;
  scale: 100;
  evidenceCoverage: number;
  recommendation: 'go' | 'watch' | 'research_more' | 'reject';
  dimensions: Array<ModernDimensionAssessment & { weight: number; points: number }>;
  unknownDimensions: ModernOpportunityDimension[];
  phase2Ready: boolean;
  phase2Blockers: string[];
  conflictDimensions: ModernOpportunityDimension[];
  staleEvidenceCount: number;
}

export function scoreModernOpportunity(assessments: ModernDimensionAssessment[], now = new Date()): ModernOpportunityScore {
  const grouped = new Map<ModernOpportunityDimension,ModernDimensionAssessment[]>();
  for (const assessment of assessments) grouped.set(assessment.dimension,[...(grouped.get(assessment.dimension)??[]),assessment]);
  let staleEvidenceCount=0;
  const conflictDimensions:ModernOpportunityDimension[]=[];
  const dimensions = modernOpportunityDimensions.map((dimension) => {
    const candidates=(grouped.get(dimension)??[]).filter(item=>{
      const stale=Boolean(item.freshUntil&&new Date(item.freshUntil).getTime()<now.getTime());
      if(stale)staleEvidenceCount++;
      return !stale;
    });
    const polarities=new Set(candidates.filter(item=>(item.confidence??1)>=0.5).map(item=>item.polarity).filter(value=>value==='supports'||value==='contradicts'));
    const conflict=polarities.has('supports')&&polarities.has('contradicts');
    if(conflict)conflictDimensions.push(dimension);
    const strongest=[...candidates].sort((a,b)=>(b.confidence??1)-(a.confidence??1))[0];
    const assessment:ModernDimensionAssessment = conflict ? {
      dimension,classification:'unknown',claim:'Fresh evidence conflicts; resolve the discrepancy before making a decision.',evidenceIds:candidates.flatMap(item=>item.evidenceIds),strength:null
    } : strongest ?? {
      dimension, classification: 'unknown' as const,
      claim: grouped.has(dimension) ? 'Only stale evidence exists for this dimension.' : 'No permitted evidence has been captured for this dimension.', evidenceIds: [], strength: null
    };
    if (assessment.strength !== null && (assessment.strength < 0 || assessment.strength > 1)) {
      throw new Error(`Evidence strength for ${dimension} must be between 0 and 1.`);
    }
    const weight = modernWeights[dimension];
    return { ...assessment, weight, points: assessment.strength === null ? 0 : Math.round(assessment.strength * (assessment.confidence??1) * weight) };
  });
  const unknownDimensions = dimensions.filter((item) => item.strength === null).map((item) => item.dimension);
  const evidenceCoverage = Number(((dimensions.length - unknownDimensions.length) / dimensions.length).toFixed(2));
  const total = dimensions.reduce((sum, item) => sum + item.points, 0);
  const required: ModernOpportunityDimension[] = ['demand', 'intent', 'serp_reality', 'competitor_quality', 'content_product_gap', 'topic_traffic_potential', 'click_potential', 'solution_fit', 'build_feasibility'];
  const phase2Blockers = required.filter((dimension) => unknownDimensions.includes(dimension)).map((dimension) => `${dimension}: evidence is UNKNOWN`);
  const phase2Ready = phase2Blockers.length === 0 && evidenceCoverage >= 0.8 && total >= 65;
  const recommendation = phase2Ready ? 'go' : evidenceCoverage < 0.5 || phase2Blockers.length ? 'research_more' : total >= 40 ? 'watch' : 'reject';
  return { total, scale: 100, evidenceCoverage, recommendation, dimensions, unknownDimensions, phase2Ready, phase2Blockers, conflictDimensions, staleEvidenceCount };
}

export const legacyCourseHeuristics = [
  'Search volume > 30,000', 'Moz KD < 25', 'Semrush KD < 40', 'DA < 20',
  'DR < 20', 'Domain age < 1 year', 'Pages < 100'
].map((statement) => ({ statement, status: 'heuristic' as const, decisionRule: false }));
