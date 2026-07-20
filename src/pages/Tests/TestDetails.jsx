import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/Loader';
import { 
  ChevronLeft, BookOpen, Clock, Award, 
  ShieldAlert, Sparkles, CheckCircle2, Trophy,
  Camera 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { Modal } from '../../components/Modal';

export const TestDetails = () => {
  const { uiStrings } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isCheckingCamera, setIsCheckingCamera] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await testService.getTestDetails(id);
        setTest(data);
      } catch (error) {
        toast.error('Failed to locate test guidelines.');
        navigate('/tests');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.warn('Camera validation failed:', err);
      return false;
    }
  };

  const handleStartExam = async () => {
    setShowConfirmModal(false);
    
    if (test?.webcamProctoring) {
      setIsCheckingCamera(true);
      const hasCamera = await checkCameraPermission();
      setIsCheckingCamera(false);
      
      if (!hasCamera) {
        setShowCameraModal(true);
        return;
      }
    }
    
    navigate(`/exam/${test.id}`);
  };

  const handleRetryCamera = async () => {
    setIsCheckingCamera(true);
    const hasCamera = await checkCameraPermission();
    setIsCheckingCamera(false);
    
    if (hasCamera) {
      setShowCameraModal(false);
      navigate(`/exam/${test.id}`);
    } else {
      toast.error('Camera still not detected or permission denied. Please follow the instructions and try again.');
    }
  };

  if (isLoading) {
    return <Loader size="lg" className="min-h-[60vh]" />;
  }

  const getDecayInfo = (attemptNumber, daysSinceRelease) => {
    let decayCorrectMarks = 5;
    const useLate = test?.useLatePenalty !== false;
    const useAttempt = test?.useAttemptPenalty !== false;

    if (attemptNumber === 1) {
      if (useLate) {
        decayCorrectMarks = daysSinceRelease <= 4 ? 5 : 4;
      } else {
        decayCorrectMarks = 5;
      }
    } else {
      if (useAttempt) {
        if (attemptNumber <= 3) {
          decayCorrectMarks = 4;
        } else if (attemptNumber <= 8) {
          decayCorrectMarks = 3;
        } else {
          decayCorrectMarks = 2;
        }
      } else {
        decayCorrectMarks = 5;
      }
    }
    const decayMultiplier = decayCorrectMarks / 5;
    const percentText = `${decayMultiplier * 100}%`;
    return { decayMultiplier, percentText };
  };

  const getPenaltyReasonText = (attemptNumber, daysSinceRelease) => {
    const useLate = test?.useLatePenalty !== false;
    const useAttempt = test?.useAttemptPenalty !== false;

    if (attemptNumber === 1) {
      if (useLate && daysSinceRelease > 4) {
        return `Late Submission Penalty — First attempt started ${daysSinceRelease} days after session opening (80% marks limit).`;
      }
      return '';
    }
    
    if (useAttempt) {
      let multiplierText = '';
      if (attemptNumber <= 3) multiplierText = '80%';
      else if (attemptNumber <= 8) multiplierText = '60%';
      else multiplierText = '40%';
      return `Repeat Attempt Penalty — Attempt #${attemptNumber} (reduced to ${multiplierText} of question marks).`;
    }
    
    return '';
  };

  const { decayMultiplier, percentText } = getDecayInfo(test?.attemptNumber || 1, test?.daysSinceRelease || 0);

  const isUpcoming = test?.startDate ? now < new Date(test.startDate) : false;
  const isExpired = test?.endDate ? now > new Date(test.endDate) : false;

  const avgCorrectMarks = test ? (test.totalMarks / test.questionsCount) : 0;
  const avgObtainableCorrectMarks = avgCorrectMarks * decayMultiplier;
  const avgNegativeMarks = test ? (test.negativeMarking !== undefined && test.negativeMarking !== null ? Number(test.negativeMarking) : 0.25) : 0.25;

  const rules = [
    'You must enter fullscreen mode to start this examination.',
    'Switching browser tabs or minimizing the window will trigger warnings. 3 warnings result in automatic submission.',
    avgNegativeMarks > 0
      ? `Each correct answer yields +${avgObtainableCorrectMarks.toFixed(2)} marks (with attempt decay applied), while incorrect answers deduct -${avgNegativeMarks.toFixed(2)} marks.`
      : `Each correct answer yields +${avgObtainableCorrectMarks.toFixed(2)} marks (with attempt decay applied), while incorrect answers carry no penalty (0 negative marks).`,
    'Progress is autosaved locally every 30 seconds to prevent data loss in case of power or network interruptions.'
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link 
          to="/tests" 
          className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Main Guidelines Card */}
      <Card variant="glass" className="p-8 border border-white/30 space-y-6">
        
        {/* Practice Mode Warning Banner */}
        {test.answerKeyActive && (
          <div className="bg-secondary/10 border-l-4 border-secondary p-4 rounded-r-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-secondary">Practice Mode Active</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                The answer key for this test is active. This attempt will run in **learning-mode / practice only** and will **not count** toward your total score, average score, or leaderboard rankings.
              </p>
            </div>
          </div>
        )}

        {/* Scheduling & Attempts Restriction Banners */}
        {isUpcoming && (
          <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-500">Upcoming Examination</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                This examination session has not opened yet. It will open on <strong>{new Date(test.startDate).toLocaleString()}</strong>.
              </p>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="bg-error/10 border-l-4 border-error p-4 rounded-r-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-error">Examination Session Closed</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                This examination session has closed and is no longer accepting new attempts. It ended on <strong>{new Date(test.endDate).toLocaleString()}</strong>.
              </p>
            </div>
          </div>
        )}

        {!isExpired && test.maxAttemptsReached && (
          <div className="bg-error/10 border-l-4 border-error p-4 rounded-r-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-error">Attempt Limit Exceeded</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                You have reached the maximum number of attempts allowed for this examination session ({test.maxAttempts}).
              </p>
            </div>
          </div>
        )}
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-outline-variant/30">
          <div>
            <div className="flex gap-2.5 items-center mb-2">
              <Badge variant={test.difficulty === 'Hard' ? 'error' : test.difficulty === 'Medium' ? 'tertiary' : 'secondary'}>
                {test.difficulty}
              </Badge>
              <span className="text-xs font-bold text-primary dark:text-primary-fixed uppercase tracking-wider">
                {test.subject}
              </span>
            </div>
            <h1 className="font-h3 text-2xl md:text-3xl font-bold text-on-surface">{test.title}</h1>
            <p className="text-xs font-medium text-on-surface-variant mt-1">{test.category}</p>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-4">
          <h3 className="font-h4 text-base md:text-lg font-bold text-on-surface flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Exam Overview
          </h3>
          <p className="font-body text-sm md:text-base text-on-surface-variant leading-relaxed">
            {test.description} This simulation assesses core theoretical concepts, numerical precision, and logic. Ensure you have a stable network and a quiet environment before initiating.
          </p>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-surface-container/50 dark:bg-surface-dim/40 rounded-2xl border border-outline-variant/20">
          <div className="flex flex-col items-center text-center p-2">
            <BookOpen className="w-6 h-6 text-primary mb-2" />
            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Questions</span>
            <span className="text-lg font-bold text-on-surface mt-1">{test.questionsCount} MCQs</span>
          </div>
          <div className="flex flex-col items-center text-center p-2 border-y sm:border-y-0 sm:border-x lg:border-x-0 border-outline-variant/30">
            <Clock className="w-6 h-6 text-primary mb-2" />
            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Duration</span>
            <span className="text-lg font-bold text-on-surface mt-1">{test.duration} Minutes</span>
          </div>
          <div className="flex flex-col items-center text-center p-2 border-b sm:border-b-0 lg:border-x border-outline-variant/30">
            <Award className="w-6 h-6 text-primary mb-2" />
            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Total Marks</span>
            <span className="text-lg font-bold text-on-surface mt-1">{test.totalMarks} Marks</span>
          </div>
          <div className="flex flex-col items-center text-center p-2">
            <Trophy className="w-6 h-6 text-primary mb-2" />
            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Attempt Max Marks</span>
            <span className="text-lg font-bold text-on-surface mt-1">{(test.totalMarks * decayMultiplier).toFixed(0)} Marks ({percentText})</span>
          </div>
        </div>

        {/* Dynamic Marking Scheme Indicator */}
        <div className="space-y-2 p-4 bg-secondary/5 dark:bg-secondary/10 rounded-2xl border border-outline-variant/20">
          <div className="text-center text-xs text-on-surface-variant font-semibold">
            Marking Scheme for this attempt: <span className="text-secondary font-bold">+{avgObtainableCorrectMarks.toFixed(2)} Marks</span> per correct answer | {avgNegativeMarks > 0 ? (
              <>incorrect answers deduct <span className="text-error font-bold">-{avgNegativeMarks.toFixed(2)} Marks</span></>
            ) : (
              <span className="text-secondary font-bold">No Negative Marking</span>
            )}
          </div>
          {decayMultiplier < 1.0 && (
            <div className="text-center text-[11px] text-amber-500 font-bold flex items-center justify-center gap-1.5 pt-1.5 border-t border-outline-variant/10">
              <span>⚠️</span>
              <span>{getPenaltyReasonText(test.attemptNumber || 1, test.daysSinceRelease || 0)}</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-4 pt-4 border-t border-outline-variant/30">
          <h3 className="font-h4 text-base md:text-lg font-bold text-on-surface flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-error" /> {uiStrings['test_guidelines_title'] || 'Proctoring & Integrity Rules'}
          </h3>
          <ul className="space-y-3.5">
            {rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs md:text-sm text-on-surface-variant leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="pt-6 flex justify-end gap-4 border-t border-outline-variant/30">
          <Button 
            variant="outline"
            onClick={() => navigate('/tests')}
          >
            Cancel
          </Button>
          {isUpcoming ? (
            <Button 
              variant="gradient"
              disabled
              className="px-10 opacity-50 cursor-not-allowed"
            >
              Starts {new Date(test.startDate).toLocaleString()}
            </Button>
          ) : isExpired ? (
            <Button 
              variant="gradient"
              disabled
              className="px-10 opacity-50 cursor-not-allowed text-error"
            >
              Exam Session Closed
            </Button>
          ) : test.maxAttemptsReached ? (
            <Button 
              variant="gradient"
              disabled
              className="px-10 opacity-50 cursor-not-allowed text-error"
            >
              Attempt Limit Reached
            </Button>
          ) : (
            <Button 
              variant="gradient"
              onClick={() => setShowConfirmModal(true)}
              className="px-10 animate-button"
            >
              Commence Examination
            </Button>
          )}
        </div>

      </Card>

      {/* Pre-Exam Attempt Notification Confirmation Modal */}
      <Modal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Examination Commencement"
        size="md"
        showCloseButton={true}
        closeOnOverlayClick={false}
      >
        <div className="space-y-6">
          <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wide">
                ⚠️ Attempt {test.attemptNumber || 1} of this test
              </h4>
              <div className="text-xs text-on-surface-variant mt-2 space-y-2 leading-relaxed">
                {test.attemptNumber === 1 ? (
                  !test.useLatePenalty || test.daysSinceRelease <= 4 ? (
                    <p>
                      <strong className="text-secondary font-bold">✅ Full Marks</strong> — Correct answers will be scored at 100% of question marks.
                    </p>
                  ) : (
                    <p>
                      <strong className="text-amber-500 font-bold">⚠️ Reduced Marks</strong> — Correct answers will be scored at 80% of question marks due to late start (opened {test.daysSinceRelease} days ago).
                    </p>
                  )
                ) : (
                  !test.useAttemptPenalty ? (
                    <p>
                      <strong className="text-secondary font-bold">✅ Full Marks</strong> — Repeat attempt penalty is disabled. Correct answers will be scored at 100% of question marks.
                    </p>
                  ) : (
                    <p>
                      <strong className="text-amber-500 font-bold">⚠️ Reduced Marks</strong> — This is a repeat attempt (#{test.attemptNumber}). Correct answers will be scored at {percentText} of question marks.
                    </p>
                  )
                )}
                {avgNegativeMarks > 0 ? (
                  <p className="border-t border-outline-variant/20 pt-2 font-medium text-error">
                    Note: Negative marking for incorrect answers stays at full value (-{avgNegativeMarks.toFixed(2)} marks) regardless of attempt number or decay.
                  </p>
                ) : (
                  <p className="border-t border-outline-variant/20 pt-2 font-medium text-secondary">
                    Note: There is no negative marking for incorrect answers in this test.
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant font-medium text-center">
            By commencing, you agree to the proctoring requirements and understand your attempt score will be calculated as stated above.
          </p>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmModal(false)}
              fullWidth
              className="h-auto min-h-[44px] py-2.5 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleStartExam}
              fullWidth
              className="h-auto min-h-[44px] py-2.5 text-xs sm:text-sm text-center"
            >
              Start Test
            </Button>
          </div>
        </div>
      </Modal>

      {/* Camera Permission Required Modal */}
      <Modal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        title="Camera Access Required"
        size="md"
        showCloseButton={true}
        closeOnOverlayClick={false}
      >
        <div className="space-y-6">
          <div className="bg-error/10 border-l-4 border-error p-4 rounded-r-xl flex items-start gap-3">
            <Camera className="w-5 h-5 text-error flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-error uppercase tracking-wide">
                Camera Blocked or Unavailable
              </h4>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed font-medium">
                This exam has **webcam proctoring** enabled and takes random security snapshots. You cannot start the exam without an active camera.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              How to enable camera permission:
            </h5>
            <ol className="list-decimal pl-5 text-xs text-on-surface-variant space-y-2.5 font-medium leading-relaxed">
              <li>
                Click the <strong>Lock / Settings icon</strong> 🔒 next to the website address in your browser's URL search bar.
              </li>
              <li>
                Locate the <strong>Camera</strong> permission toggle/dropdown and change it to <strong>Allow</strong>.
              </li>
              <li>
                If you have multiple camera hardware options, make sure one is plugged in and active.
              </li>
              <li>
                Click the <strong>Retry / Okay</strong> button below to verify and start your exam.
              </li>
            </ol>
          </div>

          <div className="flex gap-4 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCameraModal(false)}
              fullWidth
              disabled={isCheckingCamera}
              className="h-auto min-h-[44px] py-2.5 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleRetryCamera}
              fullWidth
              disabled={isCheckingCamera}
              className="h-auto min-h-[44px] py-2.5 text-xs sm:text-sm text-center flex items-center justify-center gap-1.5"
            >
              {isCheckingCamera ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Checking...
                </>
              ) : (
                'Okay / Retry'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default TestDetails;
