import React, { useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  Info,
  Loader2,
  SlidersHorizontal,
  Trash2,
  Upload,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import {
  AlgaeAnalysisResult,
  AlgaeLevel,
  DetectionSensitivity,
} from '../types/waterQuality';
import { analyzeWaterImage } from '../utils/algaeAnalyzer';

interface AlgaeDetectionPanelProps {
  analysis: AlgaeAnalysisResult | null;
  sensitivity: DetectionSensitivity;
  onAnalysisComplete: (result: AlgaeAnalysisResult | null) => void;
  onSensitivityChange: (next: DetectionSensitivity) => void;
}

type ViewMode = 'highlighted' | 'original' | 'split';

const SAMPLE_PHOTOS = [
  {
    id: 'clear',
    label: 'Clear Pond Water',
    description: 'Clean water with stones',
    src: '/src/assets/images/sample_clear_water_1794835373468.jpg',
  },
  {
    id: 'moderate',
    label: 'Patchy Green Algae',
    description: 'Surface green clusters',
    src: '/src/assets/images/sample_moderate_algae_1794835374151.jpg',
  },
  {
    id: 'heavy',
    label: 'Heavy Algae Bloom',
    description: 'Dense green surface mat',
    src: '/src/assets/images/sample_heavy_algae_1794835374603.jpg',
  },
];

function AlgaeLevelBadge({ level }: { level: AlgaeLevel }) {
  if (level === 'Low') {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
        <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>Low Algae Level</span>
      </span>
    );
  }
  if (level === 'Medium') {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
        <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>Medium Algae Level</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700">
      <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>High Algae Level</span>
    </span>
  );
}

export const AlgaeDetectionPanel: React.FC<AlgaeDetectionPanelProps> = ({
  analysis,
  sensitivity,
  onAnalysisComplete,
  onSensitivityChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('highlighted');
  const [lastSource, setLastSource] = useState<{ src: string; name: string } | null>(null);
  const [failedThumbs, setFailedThumbs] = useState<Record<string, boolean>>({});

  const runAnalysis = async (
    src: string,
    name: string,
    targetSensitivity: DetectionSensitivity = sensitivity,
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setLastSource({ src, name });
    try {
      const result = await analyzeWaterImage(src, name, targetSensitivity);
      onAnalysisComplete(result);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to scan this photo. Please try a standard JPG or PNG image.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file (JPG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        void runAnalysis(reader.result, file.name);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Could not read that file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleSensitivitySelect = (next: DetectionSensitivity) => {
    onSensitivityChange(next);
    if (lastSource) {
      void runAnalysis(lastSource.src, lastSource.name, next);
    }
  };

  const handleClearPhoto = () => {
    setLastSource(null);
    setErrorMessage(null);
    onAnalysisComplete(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section
      id="algae-detection"
      aria-labelledby="algae-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7"
    >
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2 text-sm font-medium text-sky-700">
          <Camera className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Step 2 · Water Photo Scan</span>
        </div>
        <h2
          id="algae-heading"
          className="text-2xl font-semibold tracking-tight text-slate-900"
        >
          Visible Green Algae Detection
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Upload a clear daylight photograph looking down at the water surface. Aqua Care scans the image to highlight green algae areas and estimate visible surface coverage.
        </p>
      </div>

      {/* Scientific accuracy disclaimer */}
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50/70 p-3.5 text-sm text-sky-950">
        <Info className="mt-0.5 h-4 w-4 text-sky-700 shrink-0" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Estimate Notice:</strong> The percentage shown is an estimate of visible green surface coverage in your photo, not a laboratory measurement. Avoid including green grass or trees around the edges when taking your photo.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div className="mt-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="sr-only"
          id="water-photo-upload"
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? 'border-sky-500 bg-sky-50'
              : 'border-slate-300 bg-slate-50/70 hover:border-sky-400 hover:bg-sky-50/40'
          }`}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700">
            {isAnalyzing ? (
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="h-6 w-6" aria-hidden="true" />
            )}
          </div>
          <p className="mt-3 text-base font-semibold text-slate-900">
            {isAnalyzing
              ? 'Analyzing water photograph...'
              : 'Upload a water photograph'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Drag and drop an image here, or choose a photo from your phone or computer.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <label
              htmlFor="water-photo-upload"
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              <span>Choose Water Photo</span>
            </label>

            {analysis && (
              <button
                type="button"
                onClick={handleClearPhoto}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Clear Photo</span>
              </button>
            )}
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            {errorMessage}
          </div>
        )}
      </div>

      {/* Try Sample Photos */}
      <div className="mt-6">
        <div className="text-sm font-medium text-slate-700 mb-3">
          No water photo nearby? Test the analyzer with a sample photo:
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SAMPLE_PHOTOS.map((sample) => {
            const isSelected = lastSource?.src === sample.src;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => void runAnalysis(sample.src, sample.label)}
                className={`group flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  isSelected
                    ? 'border-sky-600 bg-sky-50/80'
                    : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40'
                }`}
              >
                <div className="h-14 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-sky-100 flex items-center justify-center">
                  {failedThumbs[sample.id] ? (
                    <ImageIcon className="h-5 w-5 text-sky-600" aria-hidden="true" />
                  ) : (
                    <img
                      src={sample.src}
                      alt={sample.label}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedThumbs((prev) => ({ ...prev, [sample.id]: true }))
                      }
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {sample.label}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {sample.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis Result Viewer */}
      {analysis && (
        <div className="mt-8 border-t border-slate-200 pt-6">
          {/* Controls Toolbar */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(
                [
                  { id: 'highlighted', label: 'Highlighted Algae' },
                  { id: 'original', label: 'Original Photo' },
                  { id: 'split', label: 'Side-by-Side' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id)}
                  className={`min-h-[38px] rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === tab.id
                      ? 'bg-white text-sky-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Detection Sensitivity */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Green Sensitivity:</span>
              </span>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                {(['gentle', 'standard', 'sensitive'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleSensitivitySelect(level)}
                    className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                      sensitivity === level
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Image Canvas Display */}
          <div className="mt-4">
            {viewMode === 'split' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <img
                    src={analysis.originalDataUrl}
                    alt="Original uploaded water sample"
                    referrerPolicy="no-referrer"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="border-t border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600">
                    Original Photo · {analysis.imageName}
                  </figcaption>
                </figure>
                <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <img
                    src={analysis.highlightedDataUrl}
                    alt="Water photo with detected green algae highlighted in orange"
                    referrerPolicy="no-referrer"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="border-t border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 flex items-center justify-between gap-2">
                    <span>Highlighted Green Algae Areas</span>
                    <span className="font-mono tabular-nums text-sky-700">
                      {analysis.coveragePercent.toFixed(1)}% covered
                    </span>
                  </figcaption>
                </figure>
              </div>
            ) : (
              <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <img
                  src={
                    viewMode === 'highlighted'
                      ? analysis.highlightedDataUrl
                      : analysis.originalDataUrl
                  }
                  alt={
                    viewMode === 'highlighted'
                      ? 'Analyzed water photo highlighting detected green algae areas'
                      : 'Original water photo'
                  }
                  referrerPolicy="no-referrer"
                  className="max-h-[460px] w-full object-contain bg-slate-900/5"
                />
                <figcaption className="border-t border-slate-200 bg-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-sky-600 shrink-0" aria-hidden="true" />
                    <span>
                      {viewMode === 'highlighted'
                        ? 'Orange highlights show where visible green algae was detected.'
                        : `Showing original photo: ${analysis.imageName}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block h-3 w-3 rounded-sm bg-orange-500"
                        aria-hidden="true"
                      />
                      <span>Detected Green Algae</span>
                    </span>
                  </div>
                </figcaption>
              </figure>
            )}
          </div>

          {/* Numeric Coverage Breakdown */}
          <div className="mt-5 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-3 sm:items-center">
            <div>
              <div className="text-xs font-medium text-slate-500">
                Estimated Visible Algae Coverage
              </div>
              <div className="mt-1 font-mono text-3xl font-bold tabular-nums text-slate-900">
                {analysis.coveragePercent.toFixed(1)}%
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500">
                Algae Classification
              </div>
              <div className="mt-1.5">
                <AlgaeLevelBadge level={analysis.algaeLevel} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                <span>Surface Estimate</span>
                <span className="font-mono tabular-nums">
                  {analysis.coveragePercent.toFixed(1)}% / 100%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all duration-200 ${
                    analysis.algaeLevel === 'Low'
                      ? 'bg-emerald-500'
                      : analysis.algaeLevel === 'Medium'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, analysis.coveragePercent))}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Low: &lt;10% · Medium: 10–35% · High: &gt;35%
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
