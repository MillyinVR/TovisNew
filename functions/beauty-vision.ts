import { Handler } from '@netlify/functions';
import sharp from 'sharp';
import { analyzeLighting, getLightingRecommendations } from './lib/lighting';

interface ImageAnalysis {
  quality: number;
  lighting: number;
  composition: number;
  focus: number;
  guidance: string[];
  lightSettings?: {
    intensity: number;
    cct: number;
    hue: number;
    saturation: number;
    position: {
      angle: string;
      distance: string;
    };
  };
}

const analyzeComposition = (metadata: sharp.Metadata): number => {
  const aspectRatio = (metadata.width || 1) / (metadata.height || 1);
  const idealRatio = 1.5;
  
  return 1 - Math.min(Math.abs(aspectRatio - idealRatio) / idealRatio, 1);
};

const analyzeFocus = (metadata: sharp.Metadata): number => {
  const sizeScore = Math.min(
    (metadata.width || 0) / 1920,
    (metadata.height || 0) / 1080,
    1
  );
  
  return sizeScore;
};

const analyzeBrightness = (stats: sharp.Stats): number => {
  const channels = [stats.channels[0], stats.channels[1], stats.channels[2]];
  const meanBrightness = channels.reduce((sum, channel) => sum + channel.mean, 0) / 3;
  const stdDev = channels.reduce((sum, channel) => sum + channel.stdev, 0) / 3;
  
  const brightnessScore = 1 - Math.abs(meanBrightness - 128) / 128;
  const contrastScore = Math.min(stdDev / 64, 1);
  
  return (brightnessScore * 0.6 + contrastScore * 0.4);
};

const analyzeImage = async (imageBuffer: Buffer): Promise<ImageAnalysis> => {
  const metadata = await sharp(imageBuffer).metadata();
  const stats = await sharp(imageBuffer).stats();

  // Calculate basic image metrics
  const lighting = analyzeBrightness(stats);
  const composition = analyzeComposition(metadata);
  const focus = analyzeFocus(metadata);
  const quality = (lighting + composition + focus) / 3;

  return {
    quality,
    lighting,
    composition,
    focus,
    guidance: []
  };
};

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { imageData, service, subtype } = JSON.parse(event.body || '{}');
    
    if (!imageData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No image data provided' })
      };
    }

    const imageBuffer = Buffer.from(imageData, 'base64');
    const [analysis, colorAnalysis] = await Promise.all([
      analyzeImage(imageBuffer),
      analyzeLighting(imageBuffer)
    ]);

    // If service type is provided, get lighting recommendations
    if (service && subtype) {
      const { settings, guidance: lightingGuidance } = getLightingRecommendations(
        colorAnalysis,
        service,
        subtype
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...analysis,
          guidance: [...analysis.guidance, ...lightingGuidance],
          lightSettings: settings
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(analysis)
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to analyze image',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
