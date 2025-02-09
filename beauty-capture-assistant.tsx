import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Pause, Square, Instagram } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BeautyCapture = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFrames, setSelectedFrames] = useState([]);
  const [currentGuidance, setCurrentGuidance] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // Professional photography guidance sequences
  const guidanceSequences = [
    { prompt: "Align face at eye level for optimal engagement", duration: 5000 },
    { prompt: "Tilt chin slightly down for a flattering angle", duration: 4000 },
    { prompt: "Turn shoulders 45 degrees for dimension", duration: 4000 },
    { prompt: "Soften expression - natural smile", duration: 3000 },
    { prompt: "Perfect! Holding this composition", duration: 4000 },
    { prompt: "Create subtle movement for dynamic shots", duration: 4000 },
    { prompt: "Maintain eye contact with camera", duration: 4000 },
    { prompt: "Adjust posture - shoulders back, neck elongated", duration: 4000 }
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 3840 }, // 4K support
          height: { ideal: 2160 },
          frameRate: { ideal: 60 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        initializeRecorder(stream);
        setCurrentGuidance("Camera ready! Press 'Start Capture' when ready.");
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCurrentGuidance('Error: Unable to access camera. Please check permissions.');
    }
  };

  const initializeRecorder = (stream) => {
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 8000000 // 8 Mbps for high quality
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      processRecording(blob);
    };

    mediaRecorderRef.current = mediaRecorder;
  };

  const startRecording = () => {
    chunksRef.current = [];
    mediaRecorderRef.current.start(1000);
    setIsRecording(true);
    startGuidanceLoop();
    startDurationTimer();
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setCurrentGuidance('Processing your captures...');
  };

  const startGuidanceLoop = () => {
    let index = 0;
    const interval = setInterval(() => {
      if (!isRecording) {
        clearInterval(interval);
        return;
      }
      
      const guidance = guidanceSequences[index];
      setCurrentGuidance(guidance.prompt);
      index = (index + 1) % guidanceSequences.length;
    }, 4000);
  };

  const startDurationTimer = () => {
    setRecordingDuration(0);
    const interval = setInterval(() => {
      if (!isRecording) {
        clearInterval(interval);
        return;
      }
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const processRecording = async (blob) => {
    setProcessingStatus('Analyzing video frames...');
    
    // Simulate frame extraction and analysis
    setTimeout(() => {
      const simulatedFrames = [
        {
          id: 1,
          timestamp: '0:02',
          quality: 0.95,
          type: 'Portrait',
          aspects: {
            lighting: 0.92,
            composition: 0.96,
            focus: 0.98
          }
        },
        {
          id: 2,
          timestamp: '0:05',
          quality: 0.89,
          type: 'Detail',
          aspects: {
            lighting: 0.88,
            composition: 0.90,
            focus: 0.89
          }
        },
        {
          id: 3,
          timestamp: '0:08',
          quality: 0.92,
          type: 'Full Body',
          aspects: {
            lighting: 0.94,
            composition: 0.91,
            focus: 0.92
          }
        }
      ];

      setSelectedFrames(simulatedFrames);
      setProcessingStatus('');
      setCurrentGuidance('Review your best captures below! These frames showed optimal composition and lighting.');
    }, 2000);
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Beauty Capture Assistant</span>
            {isRecording && (
              <span className="text-red-500 text-sm">
                Recording: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video bg-gray-900 rounded overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              {streamRef.current && (
                <button
                  className={`${isRecording ? 'bg-red-500' : 'bg-blue-500'} text-white px-6 py-3 rounded-lg flex items-center space-x-2`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-5 h-5" />
                      <span>Stop Capture</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5" />
                      <span>Start Capture</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {currentGuidance && (
            <Alert className="mt-4">
              <AlertDescription className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>{currentGuidance}</span>
              </AlertDescription>
            </Alert>
          )}

          {processingStatus && (
            <div className="mt-4 text-center text-blue-500">{processingStatus}</div>
          )}

          {selectedFrames.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Best Captures</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedFrames.map(frame => (
                  <Card key={frame.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <Instagram className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="p-3">
                      <div className="font-medium">{frame.type}</div>
                      <div className="text-sm text-gray-500">Timestamp: {frame.timestamp}</div>
                      <div className="mt-2 space-y-1">
                        <div className="text-sm">
                          Quality: {(frame.quality * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Lighting: {(frame.aspects.lighting * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Composition: {(frame.aspects.composition * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Focus: {(frame.aspects.focus * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BeautyCapture;