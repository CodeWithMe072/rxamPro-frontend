import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ShieldAlert, Maximize } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const DistractionFreeLayout = ({ children, onViolation, onSnapshot, proctorActive = false }) => {
  const { uiStrings } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationsCount, setViolationsCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const containerRef = useRef(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Check fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFull = document.fullscreenElement === containerRef.current;
      setIsFullscreen(isCurrentlyFull);
      if (!isCurrentlyFull && violationsCount > 0) {
        triggerViolation('Exited Fullscreen Mode');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [violationsCount]);

  // Tab switching / Window blur detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Tab Switch Detected');
      }
    };

    const handleWindowBlur = () => {
      triggerViolation('Window Focus Lost');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Initialize camera for proctoring snapshots
  useEffect(() => {
    if (!proctorActive) return;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable for proctoring.', err);
      }
    };
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [proctorActive]);

  const takeSnapshot = useCallback(async (reason) => {
    if (!proctorActive) return;
    if (!videoRef.current || !canvasRef.current) return;
    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        if (onSnapshot) {
          onSnapshot({ image: dataUrl, reason });
        }
      }
    } catch (e) {
      console.warn('Failed to draw video frame to canvas.', e);
    }
  }, [onSnapshot, proctorActive]);

  // Periodic proctor snapshots (every 3 minutes)
  useEffect(() => {
    if (!proctorActive) return;
    const interval = setInterval(() => {
      takeSnapshot('Periodic Integrity Check');
    }, 180000);
    return () => clearInterval(interval);
  }, [takeSnapshot, proctorActive]);

  const triggerViolation = (type) => {
    setViolationsCount(prev => {
      const next = prev + 1;
      if (onViolation) {
        onViolation({ type, count: next });
      }
      return next;
    });
    takeSnapshot(`Security Violation: ${type}`);
    setShowWarningModal(true);
  };

  const requestFullscreen = () => {
    const element = containerRef.current;
    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen bg-background text-on-background select-none flex flex-col relative"
    >
      {/* Locked Fullscreen Blocker Overlay */}
      {!isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="w-20 h-20 bg-error/20 text-error rounded-full flex items-center justify-center mb-6 border border-error/30 animate-pulse">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Security Check Required</h2>
          <p className="text-slate-400 max-w-md mb-8 text-base leading-relaxed font-medium">
            {uiStrings['fullscreen_check_message'] || 'To ensure the integrity of the examination, you must enter distraction-free fullscreen mode. Navigating away, resizing, or switching screens is monitored.'}
          </p>
          <button 
            onClick={requestFullscreen}
            className="flex items-center gap-3 px-8 py-4 bg-primary text-on-primary font-bold text-base rounded-xl hover:opacity-95 shadow-xl transition-all active:scale-95 btn-primary-gradient cursor-pointer"
          >
            <Maximize className="w-5 h-5" /> Enter Fullscreen Examination
          </button>
        </div>
      )}

      {/* Security Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="glass-card rounded-[24px] max-w-md w-full p-8 text-center border-error/20 flex flex-col items-center">
            <div className="w-16 h-16 bg-error/10 text-error rounded-2xl flex items-center justify-center mb-6 border border-error/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="font-h3 text-xl font-bold text-error mb-2">Proctoring Warning</h3>
            <p className="font-body text-sm text-on-surface-variant mb-6 leading-relaxed">
              {uiStrings['proctoring_warning_message'] || 'A security violation was flagged (loss of screen focus or tab change). Switching tabs, windows, or resizing is strictly prohibited.'}
            </p>
            <div className="p-3 bg-error-container/20 border border-error-container/30 text-error rounded-xl w-full mb-6 font-bold text-sm">
              Violation Count: {violationsCount} / 3 Warnings
            </div>
            <button 
              onClick={() => {
                setShowWarningModal(false);
                requestFullscreen();
              }}
              className="w-full h-12 bg-primary text-on-primary font-button text-sm rounded-xl hover:opacity-90 transition-all active:scale-98 shadow-md cursor-pointer"
            >
              I Understand, Resume Exam
            </button>
          </div>
        </div>
      )}

      {/* Hidden camera nodes for proctor snapshots */}
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />
      <canvas ref={canvasRef} className="hidden" width={320} height={240} />

      {/* Examination canvas */}
      <div className="flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
