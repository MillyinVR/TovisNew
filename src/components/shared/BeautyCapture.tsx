import React, { useRef, useState, useEffect } from 'react';
import { Camera, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FooterNav } from './FooterNav';
import { useNavigate } from 'react-router-dom';

interface ImageData {
  uri: string;
  timestamp: string;
}

interface BeautyCaptureProps {
  onCapture: (image: ImageData) => void;
  instructions: string;
}

const BeautyCapture: React.FC<BeautyCaptureProps> = ({ onCapture, instructions }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setError('');
      }
    } catch (err: any) {
      console.error('Camera setup error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access was denied. Please grant permission through your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on your device.');
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use by another application.');
      } else {
        setError('Unable to access camera. Please ensure you\'re using HTTPS or localhost.');
      }
      setHasPermission(false);
    }
  };

  useEffect(() => {
    requestCameraPermission();
    
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);

  const retryAccess = () => {
    requestCameraPermission();
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = {
          uri: canvas.toDataURL('image/jpeg'),
          timestamp: new Date().toISOString()
        };
        onCapture(imageData);
      }
    }
  };

  if (hasPermission === null) {
    return (
      <div className="flex flex-col min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-gray-600">Requesting camera access...</p>
        </div>

        <div className="fixed bottom-0 left-0 right-0">
          <FooterNav userType="professional" />
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="flex flex-col min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        
        <div className="flex-1 p-4 max-w-lg mx-auto">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-6">
            {error}
          </AlertDescription>
        </Alert>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-6">
              {error}
            </AlertDescription>
          </Alert>
          <button
            onClick={retryAccess}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Try Again
          </button>
        </div>

        <div className="fixed bottom-0 left-0 right-0">
          <FooterNav userType="professional" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors"
      >
        <ArrowLeft className="w-6 h-6 text-gray-900" />
      </button>

      {/* Main Content */}
      <div className="flex-1 relative w-full max-w-lg mx-auto pt-16 pb-24">
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Composition Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={captureImage}
            className="rounded-full p-4 bg-white hover:bg-gray-100 transition-colors"
          >
            <Camera className="w-8 h-8 text-gray-900" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600 text-center">{instructions}</p>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0">
        <FooterNav userType="professional" />
      </div>
    </div>
  );
};

export default BeautyCapture;
