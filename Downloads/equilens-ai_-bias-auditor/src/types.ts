export interface DataRow {
  [key: string]: any;
}

export interface BiasMetric {
  groupValue: string;
  count: number;
  outcomeCount: number;
  outcomeRate: number;
  // New metrics
  truePositives?: number;
  falsePositives?: number;
  trueNegatives?: number;
  falseNegatives?: number;
  tpr?: number; // True Positive Rate
  fpr?: number; // False Positive Rate
  precision?: number;
}

export interface BiasAnalysis {
  metrics: BiasMetric[];
  disparateImpact: number;
  isBiased: boolean;
  totalRows: number;
  targetColumn: string;
  sensitiveAttribute: string;
  groundTruthColumn?: string;
  privilegedGroup: string | null;
  unprivilegedGroup: string | null;
  // Global summary metrics
  demographicParityDiff: number;
  equalizedOddsDiff?: number;
  predictiveParityDiff?: number;
  // Mitigated data storage
  mitigatedData?: DataRow[];
}

export interface AIInsights {
  explanation: string;
  rootCauses: string[];
  suggestions: string[];
}
