import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Info,
  XCircle,
} from 'lucide-react';
import { PhAssessment, QualityTier } from '../types/waterQuality';
import { clampPhValue } from '../utils/phEvaluation';

interface PhTestingPanelProps {
  phValue: number;
  assessment: PhAssessment;
  onPhChange: (nextValue: number) => void;
}

const QUICK_PRESETS = [
  { label: '4.5 Acidic', value: 4.5 },
  { label: '6.2 Mild Acid', value: 6.2 },
  { label: '7.0 Neutral', value: 7.0 },
  { label: '7.8 Healthy Pond', value: 7.8 },
  { label: '9.4 Alkaline', value: 9.4 },
];

function StatusIcon({ status }: { status: QualityTier }) {
  if (status === 'Good') {
    return <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />;
  }
  if (status === 'Fair') {
    return <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />;
  }
  return <XCircle className="h-5 w-5 text-rose-600 shrink-0" aria-hidden="true" />;
}

function statusContainerStyle(status: QualityTier): string {
  if (status === 'Good') {
    return 'border-emerald-200 bg-emerald-50/70 text-emerald-950';
  }
  if (status === 'Fair') {
    return 'border-amber-200 bg-amber-50/70 text-amber-950';
  }
  return 'border-rose-200 bg-rose-50/70 text-rose-950';
}

export const PhTestingPanel: React.FC<PhTestingPanelProps> = ({
  phValue,
  assessment,
  onPhChange,
}) => {
  const [inputText, setInputText] = useState<string>(phValue.toFixed(1));
  const [inputError, setInputError] = useState<string | null>(null);

  // Keep input text synced when slider or preset changes phValue externally
  React.useEffect(() => {
    const parsed = parseFloat(inputText);
    if (Number.isNaN(parsed) || Math.abs(parsed - phValue) > 0.05) {
      setInputText(phValue.toFixed(1));
      setInputError(null);
    }
  }, [phValue]);

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputText(raw);

    if (raw.trim() === '') {
      setInputError('Please enter a number between 0 and 14.');
      return;
    }

    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      setInputError('Please enter a valid number (for example, 7.2).');
      return;
    }

    if (parsed < 0 || parsed > 14) {
      setInputError('pH values must be between 0.0 and 14.0.');
      return;
    }

    setInputError(null);
    onPhChange(clampPhValue(parsed));
  };

  const handleBlur = () => {
    const parsed = Number(inputText);
    if (Number.isNaN(parsed) || inputText.trim() === '') {
      setInputText(phValue.toFixed(1));
      setInputError(null);
      return;
    }
    const clamped = clampPhValue(parsed);
    setInputText(clamped.toFixed(1));
    setInputError(null);
    onPhChange(clamped);
  };

  const markerPercent = Math.min(100, Math.max(0, (assessment.value / 14) * 100));

  return (
    <section
      id="ph-testing"
      aria-labelledby="ph-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7"
    >
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2 text-sm font-medium text-sky-700">
          <Droplets className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Step 1 · Manual pH Entry</span>
        </div>
        <h2
          id="ph-heading"
          className="text-2xl font-semibold tracking-tight text-slate-900"
        >
          pH Level Check (0 to 14)
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Enter the number shown on your pH test strip, liquid drop kit, or digital pH meter to see whether your water is acidic, neutral, or alkaline.
        </p>
      </div>

      {/* Transparency rule: camera cannot measure pH */}
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50/70 p-3.5 text-sm text-sky-950">
        <Info className="mt-0.5 h-4 w-4 text-sky-700 shrink-0" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Important:</strong> A regular camera photograph cannot measure water pH. Always use a real pH strip or sensor reading.
        </p>
      </div>

      {/* Input & Slider Controls */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <label
            htmlFor="ph-number-input"
            className="block text-sm font-medium text-slate-800"
          >
            Enter pH Value (0.0 – 14.0)
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              id="ph-number-input"
              type="number"
              inputMode="decimal"
              min={0}
              max={14}
              step={0.1}
              value={inputText}
              onChange={handleNumberInputChange}
              onBlur={handleBlur}
              aria-describedby={inputError ? 'ph-input-error' : 'ph-input-help'}
              className="w-32 min-h-[48px] rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-2xl font-semibold tabular-nums text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
            <div className="text-sm text-slate-600">
              <div className="font-semibold text-slate-900">{assessment.category}</div>
              <div>{assessment.detailedLabel}</div>
            </div>
          </div>
          {inputError ? (
            <p id="ph-input-error" className="mt-2 text-xs font-medium text-rose-600">
              {inputError}
            </p>
          ) : (
            <p id="ph-input-help" className="mt-2 text-xs text-slate-500">
              Type a number or drag the scale slider on the right.
            </p>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
            <span>0 · Very Acidic</span>
            <span>7 · Neutral</span>
            <span>14 · Very Alkaline</span>
          </div>

          {/* Calibrated 0-14 Spectrum Bar */}
          <div className="relative pt-2 pb-4">
            <div
              className="h-4 w-full rounded-md border border-slate-200"
              style={{
                background:
                  'linear-gradient(90deg, #dc2626 0%, #f97316 22%, #eab308 38%, #22c55e 50%, #06b6d4 65%, #2563eb 82%, #4338ca 100%)',
              }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute top-0.5 -translate-x-1/2 transition-transform duration-150"
              style={{ left: `${markerPercent}%` }}
              aria-hidden="true"
            >
              <div className="h-7 w-1.5 rounded-full bg-slate-900 ring-2 ring-white" />
            </div>

            <input
              aria-label="Select pH value from 0 to 14"
              type="range"
              min={0}
              max={14}
              step={0.1}
              value={assessment.value}
              onChange={(e) => {
                setInputError(null);
                onPhChange(clampPhValue(parseFloat(e.target.value)));
              }}
              className="mt-3 h-2 w-full cursor-pointer accent-sky-600"
            />

            <div className="mt-1 flex justify-between font-mono text-[11px] tabular-nums text-slate-400">
              <span>0</span>
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>10</span>
              <span>12</span>
              <span>14</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Test Presets */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="text-xs font-medium text-slate-500 mb-2.5">
          Try a common pH example:
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((preset) => {
            const isActive = Math.abs(assessment.value - preset.value) < 0.05;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setInputError(null);
                  onPhChange(preset.value);
                }}
                className={`min-h-[40px] rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  isActive
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-900'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live pH Classification Output */}
      <div
        className={`mt-6 rounded-lg border p-4 transition-colors ${statusContainerStyle(
          assessment.qualityStatus,
        )}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <StatusIcon status={assessment.qualityStatus} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
                <span>pH Status: {assessment.qualityStatus}</span>
                <span aria-hidden="true">·</span>
                <span>{assessment.statusHeadline}</span>
              </div>
              <p className="mt-1 text-sm opacity-90 leading-relaxed">
                {assessment.explanation}
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 border-t border-black/10 pt-3 sm:border-t-0 sm:pt-0 sm:pl-4 sm:text-right shrink-0">
            <span className="text-xs font-medium uppercase tracking-wide opacity-75">
              pH
            </span>
            <span className="font-mono text-3xl font-bold tabular-nums">
              {assessment.value.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
