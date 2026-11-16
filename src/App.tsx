import { useMemo, useState } from 'react';
import { ArrowDown, Camera, ClipboardCheck, Droplets } from 'lucide-react';
import { Header } from './components/Header';
import { PhTestingPanel } from './components/PhTestingPanel';
import { AlgaeDetectionPanel } from './components/AlgaeDetectionPanel';
import { ResultsSummary } from './components/ResultsSummary';
import { GuideSection } from './components/GuideSection';
import {
  AlgaeAnalysisResult,
  DetectionSensitivity,
} from './types/waterQuality';
import { buildOverallWaterReport, evaluatePh } from './utils/phEvaluation';

export default function App() {
  const [phValue, setPhValue] = useState<number>(7.0);
  const [algaeAnalysis, setAlgaeAnalysis] =
    useState<AlgaeAnalysisResult | null>(null);
  const [sensitivity, setSensitivity] =
    useState<DetectionSensitivity>('standard');
  const [resetCount, setResetCount] = useState<number>(0);

  const phAssessment = useMemo(() => evaluatePh(phValue), [phValue]);
  const overallReport = useMemo(
    () => buildOverallWaterReport(phAssessment, algaeAnalysis),
    [phAssessment, algaeAnalysis],
  );

  const handleResetAll = () => {
    setPhValue(7.0);
    setAlgaeAnalysis(null);
    setSensitivity('standard');
    setResetCount((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FBFF] text-slate-900">
      <Header onResetAll={handleResetAll} />

      <main className="flex-1">
        {/* Hero Overview Section */}
        <section
          id="overview"
          className="border-b border-sky-100 bg-gradient-to-b from-sky-50/90 via-white to-[#F8FBFF]"
        >
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-sky-700">
                Free · No Account Needed · Works on Phone &amp; Computer
              </p>
              <h1 className="mt-2.5 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl text-balance leading-[1.12]">
                AQUA CARE – AI Water Quality and Algae Detection System
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Check your water in three simple steps. Enter a pH reading from your test strip or meter, upload a water photograph to highlight visible green algae, and read clear care advice in plain language.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#ph-testing"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                >
                  <span>Start Water Check</span>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="#algae-detection"
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  Jump to Photo Scan
                </a>
              </div>
            </div>

            {/* 3-Step Strip */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <a
                href="#ph-testing"
                className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-sky-300"
              >
                <div className="flex items-center gap-2.5 text-sm font-semibold text-sky-800">
                  <Droplets className="h-4 w-4 text-sky-600 shrink-0" aria-hidden="true" />
                  <span>1. Enter pH Value</span>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">
                  Type a reading from 0 to 14 using your pH strip or digital sensor.
                </p>
              </a>

              <a
                href="#algae-detection"
                className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-sky-300"
              >
                <div className="flex items-center gap-2.5 text-sm font-semibold text-sky-800">
                  <Camera className="h-4 w-4 text-sky-600 shrink-0" aria-hidden="true" />
                  <span>2. Scan Water Photo</span>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">
                  Upload a photo to highlight green algae and estimate coverage.
                </p>
              </a>

              <a
                href="#results"
                className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-sky-300"
              >
                <div className="flex items-center gap-2.5 text-sm font-semibold text-sky-800">
                  <ClipboardCheck className="h-4 w-4 text-sky-600 shrink-0" aria-hidden="true" />
                  <span>3. Read Clear Results</span>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">
                  See overall status and simple steps to keep water healthy.
                </p>
              </a>
            </div>
          </div>
        </section>

        {/* Main Interactive Workflow */}
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
          <PhTestingPanel
            key={`ph-${resetCount}`}
            phValue={phValue}
            assessment={phAssessment}
            onPhChange={setPhValue}
          />

          <AlgaeDetectionPanel
            key={`algae-${resetCount}`}
            analysis={algaeAnalysis}
            sensitivity={sensitivity}
            onAnalysisComplete={setAlgaeAnalysis}
            onSensitivityChange={setSensitivity}
          />

          <ResultsSummary
            ph={phAssessment}
            algae={algaeAnalysis}
            report={overallReport}
          />

          <GuideSection />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-medium text-slate-700">
            AQUA CARE – AI Water Quality and Algae Detection System
          </p>
          <p>
            pH requires manual input or a pH sensor · Photo algae coverage is a visual estimate, not a lab test.
          </p>
        </div>
      </footer>
    </div>
  );
}
