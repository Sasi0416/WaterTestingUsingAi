export type PhCategory = 'Acidic' | 'Neutral' | 'Alkaline';

export type QualityTier = 'Good' | 'Fair' | 'Poor';

export type AlgaeLevel = 'Low' | 'Medium' | 'High';

export type DetectionSensitivity = 'gentle' | 'standard' | 'sensitive';

export interface PhAssessment {
  value: number;
  category: PhCategory;
  detailedLabel: string;
  qualityStatus: QualityTier;
  statusHeadline: string;
  explanation: string;
}

export interface AlgaeAnalysisResult {
  imageName: string;
  width: number;
  height: number;
  totalPixels: number;
  detectedPixels: number;
  coveragePercent: number;
  algaeLevel: AlgaeLevel;
  levelLabel: string;
  originalDataUrl: string;
  highlightedDataUrl: string;
  sensitivity: DetectionSensitivity;
  analyzedAt: string;
}

export interface OverallWaterReport {
  overallStatus: QualityTier;
  overallHeadline: string;
  summaryText: string;
  recommendations: string[];
}
