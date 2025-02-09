import sharp from 'sharp';

interface ColorAnalysis {
  temperature: number;
  dominantHue: number;
  saturation: number;
  brightness: number;
}

interface LightSettings {
  intensity: number;
  cct: number;
  hue: number;
  saturation: number;
  position: {
    angle: string;
    distance: string;
  };
}

const idealSettings: Record<string, Record<string, LightSettings>> = {
  hair: {
    color: {
      intensity: 80,
      cct: 5500,
      hue: 0,
      saturation: 0,
      position: {
        angle: "45° above and slightly to the side",
        distance: "3 feet away"
      }
    },
    cut: {
      intensity: 90,
      cct: 5000,
      hue: 0,
      saturation: 0,
      position: {
        angle: "multiple angles to show texture",
        distance: "2-3 feet away"
      }
    }
  },
  barber: {
    fade: {
      intensity: 100,
      cct: 5500,
      hue: 0,
      saturation: 0,
      position: {
        angle: "45° from each side to show gradient",
        distance: "2 feet away"
      }
    },
    "straight-razor": {
      intensity: 95,
      cct: 5000,
      hue: 0,
      saturation: 0,
      position: {
        angle: "30° from the side being worked on",
        distance: "18 inches away"
      }
    }
  },
  nails: {
    manicure: {
      intensity: 90,
      cct: 5000,
      hue: 0,
      saturation: 0,
      position: {
        angle: "directly above with fill light from front",
        distance: "1 foot away"
      }
    },
    art: {
      intensity: 95,
      cct: 5500,
      hue: 0,
      saturation: 0,
      position: {
        angle: "45° from above with secondary light for sparkle",
        distance: "1 foot away"
      }
    }
  },
  makeup: {
    bridal: {
      intensity: 85,
      cct: 5000,
      hue: 0,
      saturation: 0,
      position: {
        angle: "butterfly lighting (directly in front and above)",
        distance: "2 feet away"
      }
    },
    glamour: {
      intensity: 90,
      cct: 4500,
      hue: 30,
      saturation: 10,
      position: {
        angle: "Rembrandt lighting (45° above and to the side)",
        distance: "2-3 feet away"
      }
    }
  }
};

export async function analyzeLighting(imageBuffer: Buffer): Promise<ColorAnalysis> {
  const stats = await sharp(imageBuffer).stats();
  
  // Calculate color temperature based on RGB values
  const channels = stats.channels;
  const r = channels[0].mean;
  const b = channels[2].mean;
  const temperature = calculateColorTemp(r, b);
  
  // Calculate dominant hue
  const hue = calculateHue(channels[0].mean, channels[1].mean, channels[2].mean);
  
  // Calculate saturation
  const saturation = calculateSaturation(channels[0].mean, channels[1].mean, channels[2].mean);
  
  // Calculate brightness
  const brightness = (channels[0].mean + channels[1].mean + channels[2].mean) / 3;

  return {
    temperature,
    dominantHue: hue,
    saturation,
    brightness
  };
}

function calculateColorTemp(r: number, b: number): number {
  const ratio = r / b;
  if (ratio > 1.3) return 3000;  // Warm
  if (ratio < 0.8) return 6500;  // Cool
  return 5000;  // Neutral
}

function calculateHue(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;

  if (max === min) {
    return 0;
  }

  const d = max - min;
  switch (max) {
    case r:
      hue = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      hue = (b - r) / d + 2;
      break;
    case b:
      hue = (r - g) / d + 4;
      break;
  }

  return Math.round(hue * 60);
}

function calculateSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  if (max === min) {
    return 0;
  }

  const d = max - min;
  return Math.round((d / (1 - Math.abs(2 * l - 1))) * 100);
}

export function getLightingRecommendations(
  analysis: ColorAnalysis,
  service: string,
  subtype: string
): { settings: LightSettings; guidance: string[] } {
  const idealSetting = idealSettings[service]?.[subtype];
  if (!idealSetting) {
    return {
      settings: {
        intensity: 80,
        cct: 5000,
        hue: 0,
        saturation: 0,
        position: {
          angle: "45° above",
          distance: "2 feet away"
        }
      },
      guidance: ["Use standard lighting setup"]
    };
  }

  const guidance: string[] = [];
  const settings = { ...idealSetting };

  // Adjust intensity based on current brightness
  if (analysis.brightness < 100) {
    const increaseFactor = Math.round((100 - analysis.brightness) / 2);
    settings.intensity = Math.min(100, idealSetting.intensity + increaseFactor);
    guidance.push(`Increase light intensity to ${settings.intensity}%`);
  } else if (analysis.brightness > 200) {
    const decreaseFactor = Math.round((analysis.brightness - 200) / 2);
    settings.intensity = Math.max(0, idealSetting.intensity - decreaseFactor);
    guidance.push(`Decrease light intensity to ${settings.intensity}%`);
  }

  // Adjust color temperature
  const tempDiff = analysis.temperature - idealSetting.cct;
  if (Math.abs(tempDiff) > 500) {
    guidance.push(`Adjust CCT to ${idealSetting.cct}K (${tempDiff > 0 ? 'warmer' : 'cooler'})`);
  }

  // Position guidance
  guidance.push(`Position light ${settings.position.angle}, ${settings.position.distance}`);

  // Service-specific guidance
  switch (service) {
    case 'hair':
      if (subtype === 'color') {
        guidance.push('Ensure even lighting to accurately capture hair color');
        guidance.push('Add fill light from opposite side at 20% intensity');
      }
      break;
    case 'barber':
      if (subtype === 'fade') {
        guidance.push('Use two lights to show fade gradient');
        guidance.push('Main light at 45° and fill light at opposite side');
      }
      break;
    case 'nails':
      guidance.push('Use diffused lighting to minimize reflections');
      break;
    case 'makeup':
      if (subtype === 'bridal') {
        guidance.push('Add soft fill light below face for under-eye shadows');
      }
      break;
  }

  return { settings, guidance };
}
