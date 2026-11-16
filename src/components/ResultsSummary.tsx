import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Printer,
  XCircle,
} from 'lucide-react';
import {
  AlgaeAnalysisResult,
  OverallWaterReport,
  PhAssessment,
  QualityTier,
} from '../types/waterQuality';

interface ResultsSummaryProps {
  ph: PhAssessment;
  algae: AlgaeAnalysisResult | null;
  report: OverallWaterReport;
}

function StatusBannerIcon({ status }: { status: QualityTier }) {
  if (status === 'Good') {
    return <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0" aria-hidden="true" />;
  }
  if (status === 'Fair') {
    return <AlertTriangle className="h-7 w-7 text-amber-600 shrink-0" aria-hidden="true" />;
  }
  return <XCircle className="h-7 w-7 text-rose-600 shrink-0" aria-hidden="true" />;
}

function overallTheme(status: QualityTier): string {
  if (status === 'Good') {
    return 'border-emerald-200 bg-emerald-50/70 text-emerald-950';
  }
  if (status === 'Fair') {
    return 'border-amber-200 bg-amber-50/70 text-amber-950';
  }
  return 'border-rose-200 bg-rose-50/70 text-rose-950';
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  ph,
  algae,
  report,
}) => {
  const handleDownloadReport = () => {
    const lines = [
      'AQUA CARE — Water Quality & Algae Detection Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '1. pH TESTING RESULT (Manual Input)',
      `   - pH Value: ${ph.value.toFixed(1)} (Scale: 0 to 14)`,
      `   - Water Type: ${ph.category} (${ph.detailedLabel})`,
      `   - pH Status: ${ph.qualityStatus} — ${ph.statusHeadline}`,
      '',
      '2. VISIBLE ALGAE DETECTION RESULT (Photo Estimate)',
      algae
        ? `   - Photo Checked: ${algae.imageName}`
        : '   - Photo Checked: No photo uploaded yet',
      algae
        ? `   - Estimated Visible Algae Coverage: ${algae.coveragePercent.toFixed(1)}%`
        : '   - Estimated Visible Algae Coverage: Pending photo upload',
      algae
        ? `   - Algae Level: ${algae.algaeLevel} (${algae.levelLabel})`
        : '   - Algae Level: Pending',
      '',
      '3. OVERALL WATER-QUALITY STATUS',
      `   - Rating: ${report.overallStatus}`,
      `   - Summary: ${report.overallHeadline}`,
      `   - Details: ${report.summaryText}`,
      '',
      '4. SIMPLE RECOMMENDATIONS',
      ...report.recommendations.map((rec, idx) => `   ${idx + 1}. ${rec}`),
      '',
      'IMPORTANT NOTES:',
      '- A standard camera photograph cannot measure pH; pH values require a physical strip or sensor.',
      '- Algae coverage percentage is an estimate of visible green surface area, not a laboratory measurement.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aqua-care-water-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="results"
      aria-labelledby="results-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7"
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-sky-700">
            <ClipboardCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Step 3 · Easy-to-Read Summary</span>
          </div>
          <h2
            id="results-heading"
            className="mt-1 text-2xl font-semibold tracking-tight text-slate-900"
          >
            Your Water Quality Results
          </h2>
        </div>

        <div className="no-print flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleDownloadReport}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Save Text Report</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Strip */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <div className="text-xs font-medium text-slate-500">pH Value</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-slate-900">
              {ph.value.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 14.0</span>
          </div>
          <div className="mt-2 text-sm font-medium text-slate-700">
            {ph.category} · {ph.qualityStatus}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <div className="text-xs font-medium text-slate-500">
            Estimated Algae Coverage
          </div>
          {algae ? (
            <>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold tabular-nums text-slate-900">
                  {algae.coveragePercent.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500">visible green</span>
              </div>
              <div className="mt-2 text-sm font-medium text-slate-700">
                {algae.algaeLevel} Level
              </div>
            </>
          ) : (
            <>
              <div className="mt-1.5 text-2xl font-semibold text-slate-400">
                Pending
              </div>
              <div className="mt-2 text-sm text-slate-500">
                Upload a photo in Step 2 to measure
              </div>
            </>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <div className="text-xs font-medium text-slate-500">
            Water-Quality Status
          </div>
          <div className="mt-1.5 text-2xl font-bold text-slate-900">
            {report.overallStatus}
          </div>
          <div className="mt-2 text-sm font-medium text-slate-700">
            {algae ? 'Based on pH + Photo Scan' : 'Based on pH Reading Only'}
          </div>
        </div>
      </div>

      {/* Overall Verdict Banner */}
      <div
        className={`mt-5 rounded-xl border p-5 ${overallTheme(report.overallStatus)}`}
      >
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5">
            <StatusBannerIcon status={report.overallStatus} />
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-snug">
              {report.overallHeadline}
            </h3>
            <p className="mt-1 text-sm sm:text-base opacity-90 leading-relaxed">
              {report.summaryText}
            </p>
          </div>
        </div>
      </div>

      {/* Simple Recommendations */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-slate-900">
          Simple Next Steps & Recommendations
        </h3>
        <ul className="mt-3 space-y-2.5">
          {report.recommendations.map((rec, index) => (
            <li
              key={index}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-sky-50/35 px-4 py-3 text-sm sm:text-base text-slate-800"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 font-mono text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
