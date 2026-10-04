import type { ProviderAvailability } from './domain.js';

export const evidenceCapabilities = [
  'problem_signal', 'topic_interest', 'trend_interest', 'keyword_discovery',
  'serp_observation', 'competitor_observation', 'first_party_search_performance'
] as const;
export type EvidenceCapability = (typeof evidenceCapabilities)[number];
export type EvidenceSourceClass = 'official' | 'first_party' | 'public_api' | 'open_dataset' | 'open_source';

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
}

export function scoreModernOpportunity(assessments: ModernDimensionAssessment[]): ModernOpportunityScore {
  const supplied = new Map(assessments.map((assessment) => [assessment.dimension, assessment]));
  const dimensions = modernOpportunityDimensions.map((dimension) => {
    const assessment = supplied.get(dimension) ?? {
      dimension, classification: 'unknown' as const,
      claim: 'No permitted evidence has been captured for this dimension.', evidenceIds: [], strength: null
    };
    if (assessment.strength !== null && (assessment.strength < 0 || assessment.strength > 1)) {
      throw new Error(`Evidence strength for ${dimension} must be between 0 and 1.`);
    }
    const weight = modernWeights[dimension];
    return { ...assessment, weight, points: assessment.strength === null ? 0 : Math.round(assessment.strength * weight) };
  });
  const unknownDimensions = dimensions.filter((item) => item.strength === null).map((item) => item.dimension);
  const evidenceCoverage = Number(((dimensions.length - unknownDimensions.length) / dimensions.length).toFixed(2));
  const total = dimensions.reduce((sum, item) => sum + item.points, 0);
  const required: ModernOpportunityDimension[] = ['demand', 'intent', 'serp_reality', 'competitor_quality', 'content_product_gap', 'topic_traffic_potential', 'click_potential', 'solution_fit', 'build_feasibility'];
  const phase2Blockers = required.filter((dimension) => unknownDimensions.includes(dimension)).map((dimension) => `${dimension}: evidence is UNKNOWN`);
  const phase2Ready = phase2Blockers.length === 0 && evidenceCoverage >= 0.8 && total >= 65;
  const recommendation = phase2Ready ? 'go' : evidenceCoverage < 0.5 || phase2Blockers.length ? 'research_more' : total >= 40 ? 'watch' : 'reject';
  return { total, scale: 100, evidenceCoverage, recommendation, dimensions, unknownDimensions, phase2Ready, phase2Blockers };
}

export const legacyCourseHeuristics = [
  'Search volume > 30,000', 'Moz KD < 25', 'Semrush KD < 40', 'DA < 20',
  'DR < 20', 'Domain age < 1 year', 'Pages < 100'
].map((statement) => ({ statement, status: 'heuristic' as const, decisionRule: false }));
