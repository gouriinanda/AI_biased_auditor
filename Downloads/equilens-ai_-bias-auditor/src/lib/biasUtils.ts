import { BiasMetric, BiasAnalysis, DataRow } from '../types';

export const calculateBias = (
  data: DataRow[],
  targetColumn: string,
  sensitiveAttribute: string,
  groundTruthColumn?: string
): BiasAnalysis => {
  const groups: { [key: string]: { 
    count: number; 
    outcomes: number;
    tp: number; fp: number; tn: number; fn: number;
  } } = {};

  const isPos = (val: any) => 
    val === 1 || val === '1' || val === true || val === 'true' || 
    (typeof val === 'string' && ['approved', 'hired', 'yes', 'selected', 'passed'].includes(val.toLowerCase()));

  data.forEach((row) => {
    const attrValue = String(row[sensitiveAttribute]);
    const outcome = row[targetColumn];
    const predictionIsPos = isPos(outcome);
    
    if (!groups[attrValue]) {
      groups[attrValue] = { count: 0, outcomes: 0, tp: 0, fp: 0, tn: 0, fn: 0 };
    }
    
    groups[attrValue].count++;
    if (predictionIsPos) groups[attrValue].outcomes++;

    if (groundTruthColumn) {
      const actual = row[groundTruthColumn];
      const actualIsPos = isPos(actual);

      if (predictionIsPos && actualIsPos) groups[attrValue].tp++;
      if (predictionIsPos && !actualIsPos) groups[attrValue].fp++;
      if (!predictionIsPos && actualIsPos) groups[attrValue].fn++;
      if (!predictionIsPos && !actualIsPos) groups[attrValue].tn++;
    }
  });

  const metrics: BiasMetric[] = Object.keys(groups).map((key) => {
    const g = groups[key];
    const tpr = g.tp + g.fn > 0 ? g.tp / (g.tp + g.fn) : undefined;
    const fpr = g.fp + g.tn > 0 ? g.fp / (g.fp + g.tn) : undefined;
    const precision = g.tp + g.fp > 0 ? g.tp / (g.tp + g.fp) : undefined;

    return {
      groupValue: key,
      count: g.count,
      outcomeCount: g.outcomes,
      outcomeRate: g.outcomes / g.count,
      tpr, fpr, precision,
      truePositives: g.tp, falsePositives: g.fp, trueNegatives: g.tn, falseNegatives: g.fn
    };
  });

  const sortedMetrics = [...metrics].sort((a, b) => b.outcomeRate - a.outcomeRate);
  const privileged = sortedMetrics[0];
  const unprivileged = sortedMetrics[sortedMetrics.length - 1];

  const disparateImpact = privileged && privileged.outcomeRate > 0 
    ? unprivileged.outcomeRate / privileged.outcomeRate 
    : 1;

  // Global Parity Metrics
  const demographicParityDiff = Math.abs((privileged?.outcomeRate || 0) - (unprivileged?.outcomeRate || 0));
  
  let equalizedOddsDiff;
  if (groundTruthColumn && privileged && unprivileged) {
    const tprDiff = Math.abs((privileged.tpr || 0) - (unprivileged.tpr || 0));
    const fprDiff = Math.abs((privileged.fpr || 0) - (unprivileged.fpr || 0));
    equalizedOddsDiff = (tprDiff + fprDiff) / 2;
  }

  let predictiveParityDiff;
  if (groundTruthColumn && privileged && unprivileged) {
    predictiveParityDiff = Math.abs((privileged.precision || 0) - (unprivileged.precision || 0));
  }

  return {
    metrics,
    disparateImpact,
    isBiased: disparateImpact < 0.8,
    totalRows: data.length,
    targetColumn,
    sensitiveAttribute,
    groundTruthColumn,
    privilegedGroup: privileged?.groupValue || null,
    unprivilegedGroup: unprivileged?.groupValue || null,
    demographicParityDiff,
    equalizedOddsDiff,
    predictiveParityDiff
  };
};

export const simulateMitigation = (analysis: BiasAnalysis, originalData: DataRow[]): BiasAnalysis => {
  const targetDI = 0.85;
  const privilegedRate = analysis.metrics.find(m => m.groupValue === analysis.privilegedGroup)?.outcomeRate || 0;
  const targetOutcomeRate = privilegedRate * targetDI;

  // Create corrected dataset
  const mitigatedData = originalData.map(row => {
    const newRow = { ...row };
    if (String(row[analysis.sensitiveAttribute]) === analysis.unprivilegedGroup) {
      // If unprivileged, randomly change outcome to positive to meet target rate
      const currentVal = row[analysis.targetColumn];
      const isPos = (val: any) => val === 1 || val === '1' || val === true || val === 'true' || (typeof val === 'string' && ['approved', 'hired', 'yes'].includes(val.toLowerCase()));
      
      if (!isPos(currentVal) && Math.random() < (targetOutcomeRate - (analysis.metrics.find(m => m.groupValue === analysis.unprivilegedGroup)?.outcomeRate || 0))) {
        // Mock a "Hired/Approved" value based on data type intuition
        if (typeof currentVal === 'number') newRow[analysis.targetColumn] = 1;
        else if (typeof currentVal === 'boolean') newRow[analysis.targetColumn] = true;
        else newRow[analysis.targetColumn] = 'Approved';
      }
    }
    return newRow;
  });

  return {
    ...analysis,
    metrics: analysis.metrics.map(m => {
      if (m.groupValue === analysis.unprivilegedGroup) {
        return { ...m, outcomeRate: Math.max(m.outcomeRate, targetOutcomeRate) };
      }
      return m;
    }),
    disparateImpact: targetDI,
    isBiased: false,
    mitigatedData
  };
};
