import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';

export const GuideSection: React.FC = () => {
  return (
    <section
      aria-labelledby="guide-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-sky-700">
        <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Quick Reference Guide</span>
      </div>
      <h2
        id="guide-heading"
        className="mt-1 text-xl font-semibold tracking-tight text-slate-900"
      >
        How to Read Water Quality Numbers
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h3 className="text-base font-semibold text-slate-900">
            Understanding pH (0 to 14)
          </h3>
          <p>
            pH tells you how acidic or alkaline your water is. Most healthy freshwater ponds, lakes, and household water sit between <strong className="font-semibold text-slate-900">6.5 and 8.2</strong>.
          </p>
          <ul className="space-y-1.5">
            <li>
              <strong className="font-semibold text-slate-800">0.0 – 6.4 (Acidic):</strong>{' '}
              Can irritate skin, corrode metal, or stress fish.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">6.5 – 7.5 (Neutral):</strong>{' '}
              Balanced, gentle water ideal for most everyday uses.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">7.6 – 14.0 (Alkaline):</strong>{' '}
              Mildly alkaline up to 8.2 is normal; above 9.0 is too harsh.
            </li>
          </ul>
        </div>

        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h3 className="text-base font-semibold text-slate-900">
            Understanding Visible Algae Levels
          </h3>
          <p>
            Algae grows quickly in warm, sunlit, nutrient-rich water. Our photo scanner checks for green surface colors and estimates how much of the photo shows algae.
          </p>
          <ul className="space-y-1.5">
            <li>
              <strong className="font-semibold text-slate-800">Low (Under 10%):</strong>{' '}
              Clear or minimal green tint. Normal outdoor condition.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">Medium (10% – 35%):</strong>{' '}
              Noticeable green patches. Skimming and shade help keep it in check.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">High (Over 35%):</strong>{' '}
              Heavy surface bloom. Keep pets and swimmers out and consult local water guidance.
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-sky-700 shrink-0" aria-hidden="true" />
        <p>
          <strong className="font-semibold text-slate-900">Privacy & Scientific Honesty:</strong>{' '}
          No account is required, and your photos are analyzed right inside your browser without being uploaded to an external server. Remember that photo scans estimate visible green coverage only—always use laboratory testing before drinking untreated natural water.
        </p>
      </div>
    </section>
  );
};
