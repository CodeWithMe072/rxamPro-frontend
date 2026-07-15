import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ShieldAlert, Maximize } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const DistractionFreeLayout = ({ children, onViolation, onSnapshot, proctorActive = false, violationsCountProp = 0 }) => {
  const { uiStrings } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationsCount, setViolationsCount] = useState(violationsCountProp || 0);

  useEffect(() => {
    setViolationsCount(violationsCountProp || 0);
  }, [violationsCountProp]);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const containerRef = useRef(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const isRequestingCameraRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const lastViolationTimeRef = useRef(0);
  const mobileHiddenTimeoutRef = useRef(null);
  const pendingSnapshotReasonRef = useRef(null);
  const wakeLockRef = useRef(null);

  // Check fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFull = document.fullscreenElement === containerRef.current;
      setIsFullscreen(prev => {
        if (prev && !isCurrentlyFull) {
          triggerViolation('Exited Fullscreen Mode');
        }
        return isCurrentlyFull;
      });
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Tab switching / Window blur detection
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const handleVisibilityChange = () => {
      // Ignore visibility changes (tab switch/screen off) on mobile to avoid false warning counts
      if (isMobile) {
        return;
      }

      if (document.hidden) {
        triggerViolation('Tab Switch Detected');
      } else {
        // Trigger any pending snapshot now that the tab is active and visible
        if (pendingSnapshotReasonRef.current) {
          const reason = pendingSnapshotReasonRef.current;
          pendingSnapshotReasonRef.current = null;
          setTimeout(() => {
            takeSnapshot(reason);
          }, 300);
        }
      }
    };

    const handleWindowBlur = () => {
      // Ignore window focus loss (screen off/sleep) on mobile to avoid false warning counts
      if (isMobile) {
        return;
      }

      // Ignore if camera request is pending/active
      if (isRequestingCameraRef.current) {
        console.log('Window blur ignored: camera permission request active.');
        return;
      }
      triggerViolation('Browser Window Lost Focus');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Screen Wake Lock API to prevent mobile screen from auto-off/sleeping during the exam
  useEffect(() => {
    const requestWakeLock = async () => {
      if (wakeLockRef.current) return;
      try {
        if ('wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen');
          wakeLockRef.current = lock;
          console.log('Screen Wake Lock successfully acquired.');

          lock.addEventListener('release', () => {
            console.log('Screen Wake Lock was released.');
            wakeLockRef.current = null;
          });
        }
      } catch (err) {
        console.warn(`Screen Wake Lock acquisition failed: ${err.name}, ${err.message}`);
      }
    };

    requestWakeLock();

    // Re-acquire wake lock if tab becomes visible, window gains focus, or screen is touched/clicked
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    const handleFocus = () => {
      requestWakeLock();
    };

    const handleInteraction = () => {
      requestWakeLock();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      if (wakeLockRef.current) {
        wakeLockRef.current.release()
          .then(() => {
            wakeLockRef.current = null;
          })
          .catch(err => console.error('Error releasing wake lock:', err));
      }
    };
  }, []);

  // Initialize camera for proctoring snapshots
  useEffect(() => {
    if (!proctorActive) return;
    const startCamera = async () => {
      isRequestingCameraRef.current = true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable for proctoring.', err);
      } finally {
        // Set a small delay before clearing the flag to ensure the browser has fully refocused on the main window after closing the prompt
        setTimeout(() => {
          isRequestingCameraRef.current = false;
        }, 300);
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
    const now = Date.now();
    // Debounce/deduplicate consecutive violations within 1 second (e.g. back-to-back visibilitychange and blur events)
    if (now - lastViolationTimeRef.current < 1000) {
      console.log(`Deduplicated focus/tab switch violation: ${type}`);
      return;
    }
    lastViolationTimeRef.current = now;

    // Exiting fullscreen is always a violation and not bypassed.
    // Tab Switch and Window Focus blurs are bypassed during the first 3 minutes (180,000 ms) of setup.
    if (type !== 'Exited Fullscreen Mode' && (now - startTimeRef.current < 180000)) {
      console.log(`Bypassed focus loss/tab change violation: ${type} (Setup Period)`);
      return;
    }
    setViolationsCount(prev => {
      const next = prev + 1;
      if (onViolation) {
        onViolation({ type, count: next });
      }
      return next;
    });

    const reason = `Security Violation: ${type}`;
    if (document.hidden) {
      // Store to take the snapshot when they return to the tab
      pendingSnapshotReasonRef.current = reason;
    } else {
      takeSnapshot(reason);
    }
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
      className={`min-h-screen bg-background text-on-background select-none flex flex-col relative ${isFullscreen ? '!h-screen !overflow-y-auto' : ''}`}
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
