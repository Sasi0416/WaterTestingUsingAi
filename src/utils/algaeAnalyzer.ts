import {
  AlgaeAnalysisResult,
  AlgaeLevel,
  DetectionSensitivity,
} from '../types/waterQuality';

interface SensitivityThresholds {
  minSaturation: number;
  minValue: number;
  minHue: number;
  maxHue: number;
  minExcessGreen: number;
  greenToRedRatio: number;
  greenToBlueRatio: number;
}

const THRESHOLDS: Record<DetectionSensitivity, SensitivityThresholds> = {
  gentle: {
    minSaturation: 0.24,
    minValue: 0.16,
    minHue: 66,
    maxHue: 152,
    minExcessGreen: 0.08,
    greenToRedRatio: 1.04,
    greenToBlueRatio: 1.12,
  },
  standard: {
    minSaturation: 0.17,
    minValue: 0.12,
    minHue: 60,
    maxHue: 158,
    minExcessGreen: 0.04,
    greenToRedRatio: 0.99,
    greenToBlueRatio: 1.05,
  },
  sensitive: {
    minSaturation: 0.12,
    minValue: 0.10,
    minHue: 55,
    maxHue: 166,
    minExcessGreen: 0.015,
    greenToRedRatio: 0.95,
    greenToBlueRatio: 1.01,
  },
};

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta > 0) {
    if (max === rn) {
      h = 60 * (((gn - bn) / delta) % 6);
    } else if (max === gn) {
      h = 60 * ((bn - rn) / delta + 2);
    } else {
      h = 60 * ((rn - gn) / delta + 4);
    }
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return [h, s, v];
}

export function classifyAlgaeLevel(coveragePercent: number): {
  level: AlgaeLevel;
  label: string;
} {
  if (coveragePercent < 10) {
    return { level: 'Low', label: 'Low Visible Algae' };
  }
  if (coveragePercent <= 35) {
    return { level: 'Medium', label: 'Medium Visible Algae' };
  }
  return { level: 'High', label: 'High Visible Algae' };
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('Could not load this image file. Please try a JPG or PNG photo.'));
    img.src = src;
  });
}

export async function analyzeWaterImage(
  imageSrc: string,
  imageName: string,
  sensitivity: DetectionSensitivity = 'standard',
): Promise<AlgaeAnalysisResult> {
  const img = await loadImageElement(imageSrc);

  const maxDim = 640;
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
  const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
  const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));

  const originalCanvas = document.createElement('canvas');
  originalCanvas.width = width;
  originalCanvas.height = height;
  const origCtx = originalCanvas.getContext('2d');
  if (!origCtx) {
    throw new Error('Browser canvas is unavailable for image analysis.');
  }
  origCtx.drawImage(img, 0, 0, width, height);

  const originalDataUrl = originalCanvas.toDataURL('image/jpeg', 0.92);
  const imageData = origCtx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const highlightCanvas = document.createElement('canvas');
  highlightCanvas.width = width;
  highlightCanvas.height = height;
  const highlightCtx = highlightCanvas.getContext('2d');
  if (!highlightCtx) {
    throw new Error('Browser canvas is unavailable for highlighting.');
  }

  const outData = highlightCtx.createImageData(width, height);
  const out = outData.data;

  const t = THRESHOLDS[sensitivity];
  const totalPixels = width * height;
  const mask = new Uint8Array(totalPixels);
  let detectedPixels = 0;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const [h, s, v] = rgbToHsv(r, g, b);
    const exG = (2 * g - r - b) / 255;

    const isGreenHue = h >= t.minHue && h <= t.maxHue;
    const isSufficientColor = s >= t.minSaturation && v >= t.minValue;
    const isGreenDominant =
      g >= r * t.greenToRedRatio &&
      g >= b * t.greenToBlueRatio &&
      exG >= t.minExcessGreen;

    if (isGreenHue && isSufficientColor && isGreenDominant) {
      mask[i] = 1;
      detectedPixels++;
    }
  }

  // Render high-contrast highlighted visualization:
  // Non-algae water is slightly cooled & softened so detected green algae areas stand out unmistakably
  // in vivid amber-coral highlight with crisp boundary edges.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (mask[i] === 1) {
        // Check if pixel sits on edge of a detected algae cluster for crisp contour visibility
        const isEdge =
          x === 0 ||
          y === 0 ||
          x === width - 1 ||
          y === height - 1 ||
          mask[i - 1] === 0 ||
          mask[i + 1] === 0 ||
          mask[i - width] === 0 ||
          mask[i + width] === 0;

        if (isEdge) {
          // Crisp bright amber-orange border around detected green algae
          out[idx] = 251;
          out[idx + 1] = 146;
          out[idx + 2] = 60;
          out[idx + 3] = 255;
        } else {
          // Blend vivid highlight tint over detected green algae while preserving surface texture
          out[idx] = Math.min(255, Math.round(r * 0.42 + 249 * 0.58));
          out[idx + 1] = Math.min(255, Math.round(g * 0.42 + 115 * 0.58));
          out[idx + 2] = Math.min(255, Math.round(b * 0.42 + 22 * 0.58));
          out[idx + 3] = 255;
        }
      } else {
        // Desaturate and subtly dim background water so highlighted algae regions are effortless to inspect
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        out[idx] = Math.round((r * 0.55 + luma * 0.45) * 0.82);
        out[idx + 1] = Math.round((g * 0.55 + luma * 0.45) * 0.85);
        out[idx + 2] = Math.round((b * 0.55 + luma * 0.45) * 0.92);
        out[idx + 3] = 255;
      }
    }
  }

  highlightCtx.putImageData(outData, 0, 0);
  const highlightedDataUrl = highlightCanvas.toDataURL('image/jpeg', 0.92);

  const coveragePercent = Math.round((detectedPixels / totalPixels) * 1000) / 10;
  const { level, label } = classifyAlgaeLevel(coveragePercent);

  return {
    imageName,
    width,
    height,
    totalPixels,
    detectedPixels,
    coveragePercent,
    algaeLevel: level,
    levelLabel: label,
    originalDataUrl,
    highlightedDataUrl,
    sensitivity,
    analyzedAt: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}
