import {
  AlgaeAnalysisResult,
  OverallWaterReport,
  PhAssessment,
  PhCategory,
  QualityTier,
} from '../types/waterQuality';

export function clampPhValue(raw: number): number {
  if (Number.isNaN(raw)) return 7.0;
  return Math.min(14, Math.max(0, Math.round(raw * 10) / 10));
}

export function evaluatePh(rawValue: number): PhAssessment {
  const value = clampPhValue(rawValue);

  let category: PhCategory = 'Neutral';
  let detailedLabel = 'Balanced Neutral';
  let qualityStatus: QualityTier = 'Good';
  let statusHeadline = 'Good pH Balance';
  let explanation =
    'Your pH reading sits right in the healthy freshwater comfort zone (6.5 to 8.2).';

  if (value < 5.5) {
    category = 'Acidic';
    detailedLabel = 'Strongly Acidic';
    qualityStatus = 'Poor';
    statusHeadline = 'Too Acidic (Out of Safe Range)';
    explanation =
      'Water below pH 5.5 is strongly acidic. It can irritate skin or eyes, corrode pipes, and harm fish or plants.';
  } else if (value < 6.5) {
    category = 'Acidic';
    detailedLabel = 'Mildly Acidic';
    qualityStatus = 'Fair';
    statusHeadline = 'Slightly Acidic (Needs Monitoring)';
    explanation =
      'Water between 5.5 and 6.4 is mildly acidic. Keep an eye on it, as healthy ponds and tap water usually sit closer to 7.0.';
  } else if (value <= 7.5) {
    category = 'Neutral';
    detailedLabel = value === 7.0 ? 'Pure Neutral' : 'Near Neutral';
    qualityStatus = 'Good';
    statusHeadline = 'Good pH Balance';
    explanation =
      'A pH between 6.5 and 7.5 is neutral and well-balanced for most freshwater ponds, aquariums, and general outdoor water.';
  } else if (value <= 8.2) {
    category = 'Alkaline';
    detailedLabel = 'Mildly Alkaline';
    qualityStatus = 'Good';
    statusHeadline = 'Good pH Balance';
    explanation =
      'Water between 7.6 and 8.2 is mildly alkaline and still comfortable for most outdoor ponds and natural freshwater.';
  } else if (value <= 9.0) {
    category = 'Alkaline';
    detailedLabel = 'Moderately Alkaline';
    qualityStatus = 'Fair';
    statusHeadline = 'Elevated Alkalinity (Needs Monitoring)';
    explanation =
      'Water between 8.3 and 9.0 is noticeably alkaline. Rapid algae growth can push pH higher during sunny afternoons.';
  } else {
    category = 'Alkaline';
    detailedLabel = 'Strongly Alkaline';
    qualityStatus = 'Poor';
    statusHeadline = 'Too Alkaline (Out of Safe Range)';
    explanation =
      'Water above pH 9.0 is strongly alkaline and can stress aquatic life, reduce water usability, and cause mineral scaling.';
  }

  return {
    value,
    category,
    detailedLabel,
    qualityStatus,
    statusHeadline,
    explanation,
  };
}

export function buildOverallWaterReport(
  ph: PhAssessment,
  algae: AlgaeAnalysisResult | null,
): OverallWaterReport {
  if (!algae) {
    const recommendations: string[] = [];

    if (ph.qualityStatus === 'Poor') {
      recommendations.push(
        ph.category === 'Acidic'
          ? 'Avoid direct skin contact or adding fish until the pH is brought closer to 6.5–8.0 using a water-safe buffer.'
          : 'Avoid using this water for sensitive plants or fish until pH is lowered safely toward 6.5–8.0.',
      );
      recommendations.push(
        'Re-test with a clean pH meter or fresh test strip to confirm the reading.',
      );
    } else if (ph.qualityStatus === 'Fair') {
      recommendations.push(
        'Monitor pH again at the same time tomorrow to see if the reading is drifting.',
      );
      recommendations.push(
        'Check for rainwater runoff, decaying leaves, or limestone/concrete contact that may shift pH.',
      );
    } else {
      recommendations.push(
        'Your pH is in a healthy range. Keep testing weekly if this is a pond, tank, or pool.',
      );
    }

    recommendations.push(
      'Upload a water photograph in Step 2 (or try a sample photo) to include visible green algae analysis in your report.',
    );

    return {
      overallStatus: ph.qualityStatus,
      overallHeadline:
        ph.qualityStatus === 'Good'
          ? 'pH Looks Good (Photo Scan Pending)'
          : `${ph.statusHeadline} (Photo Scan Pending)`,
      summaryText:
        'Your pH reading has been evaluated. Upload a photo of the water surface to complete the visible algae check.',
      recommendations,
    };
  }

  // Combine pH qualityStatus and algaeLevel
  let overallStatus: QualityTier = 'Good';
  let overallHeadline = 'Good Overall Water Quality';
  let summaryText =
    'Both your pH reading and visible algae check look healthy. No urgent action is needed.';

  if (ph.qualityStatus === 'Poor' || algae.algaeLevel === 'High') {
    overallStatus = 'Poor';
    if (ph.qualityStatus === 'Poor' && algae.algaeLevel === 'High') {
      overallHeadline = 'Poor Water Quality — High Algae & Out-of-Range pH';
      summaryText =
        'Both the pH level and the amount of visible green algae need attention before regular use.';
    } else if (algae.algaeLevel === 'High') {
      overallHeadline = 'Action Needed — High Visible Algae Bloom';
      summaryText = `Your pH is ${ph.value.toFixed(1)} (${ph.category}), but an estimated ${algae.coveragePercent.toFixed(1)}% of the photo shows green algae coverage.`;
    } else {
      overallHeadline = `Action Needed — ${ph.statusHeadline}`;
      summaryText = `Visible algae is ${algae.algaeLevel.toLowerCase()} (${algae.coveragePercent.toFixed(1)}%), but your pH (${ph.value.toFixed(1)}) is outside the healthy range.`;
    }
  } else if (ph.qualityStatus === 'Fair' || algae.algaeLevel === 'Medium') {
    overallStatus = 'Fair';
    overallHeadline = 'Fair Water Quality — Simple Care Recommended';
    summaryText = `Your pH is ${ph.value.toFixed(1)} (${ph.category}) with an estimated ${algae.coveragePercent.toFixed(1)}% visible green algae (${algae.algaeLevel} level).`;
  }

  const recommendations: string[] = [];

  if (algae.algaeLevel === 'High') {
    recommendations.push(
      'Avoid swimming, drinking, or letting pets enter the water until the heavy green algae bloom clears.',
    );
    recommendations.push(
      'Gently skim floating algae mats with a fine net and improve water movement with a pump, aerator, or fountain.',
    );
    recommendations.push(
      'Reduce excess nutrients entering the water (keep lawn fertilizers, grass clippings, and pet waste away from the edge).',
    );
  } else if (algae.algaeLevel === 'Medium') {
    recommendations.push(
      'Remove visible green patches with a skimmer net before they spread further in warm sunlight.',
    );
    recommendations.push(
      'Add shade or surface circulation to slow down algae growth during sunny days.',
    );
    recommendations.push(
      'Re-check the water in 3 to 5 days to make sure coverage is shrinking rather than expanding.',
    );
  } else {
    recommendations.push(
      'Visible green algae is low. Keep leaves and debris out of the water to maintain clarity.',
    );
  }

  if (ph.qualityStatus === 'Poor') {
    recommendations.push(
      ph.category === 'Acidic'
        ? `pH is strongly acidic (${ph.value.toFixed(1)}). Re-verify with a calibrated meter or fresh strip and avoid adding fish until pH rises above 6.5.`
        : `pH is strongly alkaline (${ph.value.toFixed(1)}). Heavy sunlight and algae can push pH up; verify with a fresh test and improve aeration.`,
    );
  } else if (ph.qualityStatus === 'Fair') {
    recommendations.push(
      `pH is slightly outside ideal (${ph.value.toFixed(1)}). Test again tomorrow morning and afternoon to see if levels stabilize.`,
    );
  } else {
    recommendations.push(
      `pH (${ph.value.toFixed(1)}) is within the healthy 6.5–8.2 freshwater range.`,
    );
  }

  return {
    overallStatus,
    overallHeadline,
    summaryText,
    recommendations,
  };
}
