export const findingClassifications = ['fact', 'observation', 'inference', 'unknown'] as const;
export type FindingClassification = (typeof findingClassifications)[number];

export const validationDimensions = [
  'audience',
  'search_surfaces',
  'geography_language',
  'serp_weakness',
  'product_gap',
  'traffic_potential',
  'build_cost',
  'defensibility'
] as const;
export type ValidationDimension = (typeof validationDimensions)[number];
export type MarketRecommendation = 'go' | 'watch' | 'research_more' | 'reject';

export interface MarketStudy {
  id: string;
  brief: string;
  language: string;
  market: string;
  status: 'created' | 'researching' | 'awaiting_review' | 'completed' | 'stopped' | 'failed';
  sourcePolicy: 'free_public_web';
  paidBudgetCents: 0;
  requestLimit: number;
  timeLimitSeconds: number;
  createdAt: string;
}

export interface MarketFinding {
  id: string;
  marketStudyId: string;
  opportunityId?: string;
  dimension: ValidationDimension;
  classification: FindingClassification;
  claim: string;
  evidenceIds: string[];
  confidence: number;
}

export interface DimensionAssessment {
  dimension: ValidationDimension;
  classification: FindingClassification;
  claim: string;
  evidenceIds: string[];
  /** 0..1 evidence strength. Null means UNKNOWN and earns no points. */
  strength: number | null;
}

export interface OpportunityScore {
  total: number;
  scale: 100;
  evidenceCoverage: number;
  recommendation: MarketRecommendation;
  dimensions: Array<DimensionAssessment & { weight: number; points: number }>;
  unknownDimensions: ValidationDimension[];
}

const weights: Record<ValidationDimension, number> = {
  audience: 10,
  search_surfaces: 15,
  geography_language: 5,
  serp_weakness: 15,
  product_gap: 15,
  traffic_potential: 15,
  build_cost: 10,
  defensibility: 15
};

export function scoreOpportunity(assessments: DimensionAssessment[]): OpportunityScore {
  const byDimension = new Map(assessments.map((item) => [item.dimension, item]));
  const dimensions = validationDimensions.map((dimension) => {
    const supplied = byDimension.get(dimension);
    const assessment: DimensionAssessment = supplied ?? {
      dimension,
      classification: 'unknown',
      claim: 'No permitted evidence has been captured for this dimension.',
      evidenceIds: [],
      strength: null
    };
    if (assessment.strength !== null && (assessment.strength < 0 || assessment.strength > 1)) {
      throw new Error(`Evidence strength for ${dimension} must be between 0 and 1.`);
    }
    const weight = weights[dimension];
    return { ...assessment, weight, points: assessment.strength === null ? 0 : Math.round(assessment.strength * weight) };
  });
  const unknownDimensions = dimensions.filter((item) => item.strength === null).map((item) => item.dimension);
  const evidenceCoverage = Number(((dimensions.length - unknownDimensions.length) / dimensions.length).toFixed(2));
  const total = dimensions.reduce((sum, item) => sum + item.points, 0);
  const criticalUnknown = unknownDimensions.some((dimension) => ['search_surfaces', 'serp_weakness', 'product_gap'].includes(dimension));
  const recommendation: MarketRecommendation = evidenceCoverage < 0.5 || criticalUnknown
    ? 'research_more'
    : total >= 70 && evidenceCoverage >= 0.75
      ? 'go'
      : total >= 40
        ? 'watch'
        : 'reject';
  return { total, scale: 100, evidenceCoverage, recommendation, dimensions, unknownDimensions };
}
