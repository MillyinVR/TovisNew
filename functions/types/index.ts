export interface LightingAnalysis {
  brightness: number;
  contrast: number;
  highlights: number;
  shadows: number;
  uniformity: number;
}

export interface FaceDetection {
  count: number;
  locations: Array<{x: number, y: number, width: number, height: number}>;
  landmarks: Array<{type: string, x: number, y: number}>;
  attributes: {
    age: number;
    gender: string;
    expression: string;
  };
}

export interface MakeupDetection {
  eyes: boolean;
  lips: boolean;
  foundation: boolean;
  quality: number;
}

export interface BeautyAnalysis {
  faceDetection: FaceDetection;
  makeupDetection: MakeupDetection;
  skinAnalysis: {
    tone: string;
    texture: string;
    spots: number;
    wrinkles: number;
  };
  hairAnalysis: {
    color: string;
    style: string;
    length: string;
    health: number;
  };
}