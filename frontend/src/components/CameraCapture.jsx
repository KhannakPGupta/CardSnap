import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, X, Sparkles } from 'lucide-react';

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Could not access camera device. Check browser permissions or upload an image file instead.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `card_camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage({ file, previewUrl: dataUrl });
        stopCamera();
      }
    }, 'image/jpeg', 0.92);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirmScan = () => {
    if (capturedImage?.file) {
      onCapture(capturedImage.file, capturedImage.previewUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="cyber-panel-glow rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col hud-corner">
        
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-heading">
            <Camera className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-base">Optic Viewfinder Core</span>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative bg-black flex-1 min-h-[360px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
          
          {error ? (
            <div className="p-8 text-center max-w-md">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <p className="text-slate-300 mb-6 text-sm">{error}</p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 neon-btn-primary text-black font-extrabold text-xs rounded-xl font-heading"
              >
                Use File Upload Instead
              </button>
            </div>
          ) : capturedImage ? (
            /* Preview Captured Photo */
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={capturedImage.previewUrl}
                alt="Captured business card"
                className="max-h-[380px] w-auto rounded-xl shadow-2xl border border-cyan-500/40 object-contain"
              />
            </div>
          ) : (
            /* Live Camera View */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Sci-Fi Targeting Frame Guide */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="w-full max-w-sm aspect-[1.75/1] border-2 border-cyan-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(5,7,13,0.7)] flex items-center justify-center">
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-cyan-400"></div>
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-cyan-400"></div>
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-cyan-400"></div>
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-cyan-400"></div>
                  
                  <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-300 bg-slate-950/90 px-4 py-1.5 rounded-full border border-cyan-500/40 flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" /> ALIGN CARD INSIDE RETICLE
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-center gap-4">
          {!capturedImage && cameraActive && (
            <button
              onClick={handleCapture}
              className="px-7 py-3 neon-btn-primary text-black font-extrabold text-xs rounded-xl flex items-center gap-2 font-heading uppercase tracking-wider cursor-pointer"
            >
              <Camera className="w-4 h-4 text-black" />
              <span>Capture Frame</span>
            </button>
          )}

          {capturedImage && (
            <>
              <button
                onClick={handleRetake}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-800 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake</span>
              </button>
              
              <button
                onClick={handleConfirmScan}
                className="px-7 py-2.5 neon-btn-primary text-black font-extrabold text-xs rounded-xl flex items-center gap-2 font-heading uppercase tracking-wider cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Execute Scan</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
