import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../../services/exam.service';
import { DistractionFreeLayout as SecuredLayout } from '../../layout/DistractionFreeLayout';
import { Timer } from '../../components/Exam/Timer';
import { QuestionPalette } from '../../components/Exam/QuestionPalette';
import { QuestionCard } from '../../components/Exam/QuestionCard';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Loader } from '../../components/Loader';
import { School, ChevronLeft, ChevronRight, Trash, Flag, CheckCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ExamScreen = () => {
  const { id: testId, attemptId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [qStates, setQStates] = useState({});
  const [warningCount, setWarningCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showNavigatorModal, setShowNavigatorModal] = useState(false);

  const cacheKey = `exam_cache_${testId}`;

  // Fetch / Load session
  useEffect(() => {
    const initExam = async () => {
      try {
        if (attemptId) {
          const details = await examService.getAttemptDetails(attemptId);
          if (details.status !== 'ongoing') {
            toast.error('This attempt session has already been completed.');
            navigate(`/results/summary?attemptId=${attemptId}`, { replace: true });
            return;
          }
        }

        const data = await examService.startExam(testId);
        setSession(data);

        if (!attemptId) {
          navigate(`/exam/${testId}/attempt/${data.sessionId}`, { replace: true });
          return;
        }

        const details = await examService.getAttemptDetails(attemptId);
        setWarningCount(details.warningCount || 0);

        const loadedAnswers = {};
        const initialStates = {};
        
        data.questions.forEach((q, idx) => {
          const persisted = details.answers[q.id];
          if (persisted) {
            loadedAnswers[q.id] = persisted.selectedOption || '';
            initialStates[q.id] = persisted.status || 'unvisited';
          } else {
            initialStates[q.id] = idx === 0 ? 'visited' : 'unvisited';
          }
        });

        setAnswers(loadedAnswers);
        setQStates(initialStates);

        const firstUnansweredIdx = data.questions.findIndex(q => {
          const ans = loadedAnswers[q.id];
          const state = initialStates[q.id];
          return !ans && state !== 'marked';
        });

        if (firstUnansweredIdx !== -1) {
          setCurrentIdx(firstUnansweredIdx);
        } else {
          setCurrentIdx(data.questions.length - 1);
        }
      } catch (error) {
        toast.error('Failed to initialize exam session.');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    initExam();
  }, [testId, attemptId, navigate]);

  // Caching checkpoint
  const saveProgressLocal = useCallback((currentAnswers, currentStates, index) => {
    localStorage.setItem(cacheKey, JSON.stringify({
      answers: currentAnswers,
      qStates: currentStates,
      index
    }));
  }, [cacheKey]);

  const activeQuestion = session?.questions[currentIdx];

  const handleAnswerSelect = async (optionValue) => {
    const updatedAnswers = { ...answers, [activeQuestion.id]: optionValue };
    const updatedStates = { ...qStates, [activeQuestion.id]: 'answered' };
    
    setAnswers(updatedAnswers);
    setQStates(updatedStates);
    saveProgressLocal(updatedAnswers, updatedStates, currentIdx);

    if (session?.sessionId) {
      try {
        await examService.saveAnswer(session.sessionId, activeQuestion.id, optionValue);
      } catch (err) {
        console.error('Failed to save answer:', err);
      }
    }
  };

  const handleNext = () => {
    if (!session) return;
    const nextIdx = currentIdx + 1;
    if (nextIdx < session.questions.length) {
      const nextQId = session.questions[nextIdx].id;
      const updatedStates = { ...qStates };
      
      // Update state for next question if unvisited
      if (updatedStates[nextQId] === 'unvisited') {
        updatedStates[nextQId] = 'visited';
      }
      
      // Update state of current question if not answered or marked
      if (updatedStates[activeQuestion.id] === 'visited') {
        updatedStates[activeQuestion.id] = 'missed';
      }

      setQStates(updatedStates);
      setCurrentIdx(nextIdx);
      saveProgressLocal(answers, updatedStates, nextIdx);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      const prevQId = session.questions[prevIdx].id;
      const updatedStates = { ...qStates };

      if (updatedStates[prevQId] === 'unvisited') {
        updatedStates[prevQId] = 'visited';
      }

      setQStates(updatedStates);
      setCurrentIdx(prevIdx);
      saveProgressLocal(answers, updatedStates, prevIdx);
    }
  };

  const handleClear = async () => {
    const updatedAnswers = { ...answers };
    delete updatedAnswers[activeQuestion.id];
    
    const updatedStates = { ...qStates, [activeQuestion.id]: 'visited' };

    setAnswers(updatedAnswers);
    setQStates(updatedStates);
    saveProgressLocal(updatedAnswers, updatedStates, currentIdx);
    toast.success('Cleared selected response.');

    if (session?.sessionId) {
      try {
        await examService.clearAnswer(session.sessionId, activeQuestion.id);
      } catch (err) {
        console.error('Failed to clear answer:', err);
      }
    }
  };

  const handleMarkForReview = async () => {
    const updatedStates = { ...qStates, [activeQuestion.id]: 'marked' };
    setQStates(updatedStates);
    saveProgressLocal(answers, updatedStates, currentIdx);
    toast.success('Marked question for review.');
    handleNext();

    if (session?.sessionId) {
      try {
        await examService.markReview(session.sessionId, activeQuestion.id);
      } catch (err) {
        console.error('Failed to mark review:', err);
      }
    }
  };

  const handleQuestionSelect = (index) => {
    const updatedStates = { ...qStates };
    const targetQId = session.questions[index].id;
    
    if (updatedStates[targetQId] === 'unvisited') {
      updatedStates[targetQId] = 'visited';
    }

    if (updatedStates[activeQuestion.id] === 'visited') {
      updatedStates[activeQuestion.id] = 'missed';
    }

    setQStates(updatedStates);
    setCurrentIdx(index);
    saveProgressLocal(answers, updatedStates, index);
  };

  const executeSubmission = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const results = await examService.submitExam(session.sessionId, answers);
      localStorage.removeItem(cacheKey);
      toast.success('Examination submitted successfully!');
      navigate(`/results/summary`, { state: { results, justCompleted: true }, replace: true });
    } catch (e) {
      toast.error('Failed to submit. Retrying...');
    } finally {
      setIsLoading(false);
    }
  }, [session, answers, cacheKey, navigate]);

  // Keyboard bindings
  useEffect(() => {
    if (!session || showSubmitModal) return;

    const handleKeyDown = (e) => {
      // Keys 1, 2, 3, 4 to select options
      if (['1', '2', '3', '4'].includes(e.key) && activeQuestion) {
        const optionIds = ['A', 'B', 'C', 'D'];
        const targetId = optionIds[parseInt(e.key) - 1];
        const optionExists = activeQuestion.options.some(opt => opt.id === targetId);
        if (optionExists) {
          handleAnswerSelect(targetId);
        }
      }

      // Arrows to navigate
      if (e.key === 'ArrowRight') {
        handleNext();
      }
      if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, activeQuestion, currentIdx, answers, qStates, showSubmitModal]);

  const handleProctorViolation = async ({ type }) => {
    if (!session?.sessionId) return;
    try {
      const data = await examService.logWarning(session.sessionId, type);
      setWarningCount(data.warningCount);

      if (data.autoSubmitted) {
        toast.error('Maximum warnings exceeded. Submitting examination automatically.');
        executeSubmission();
      } else {
        toast.error(`Security Violation Flagged (Warning ${data.warningCount} of ${data.maxWarnings + 1}): ${type}`);
      }
    } catch (error) {
      console.error('Failed to log warning:', error);
      toast.error(`Security Violation Flagged: ${type}`);
    }
  };

  const handleSnapshot = useCallback(async ({ image, reason }) => {
    if (!session?.sessionId) return;
    try {
      await examService.uploadProctorSnapshot(session.sessionId, image, reason);
    } catch (e) {
      console.warn('Failed to upload proctor snapshot:', e);
    }
  }, [session]);

  if (isLoading || !session) {
    return <Loader size="lg" className="min-h-screen" />;
  }

  if (!session.questions || session.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center p-6 text-on-surface">
        <HelpCircle className="w-16 h-16 text-error animate-bounce" />
        <h1 className="text-xl font-bold">No Questions Configured</h1>
        <p className="text-sm text-on-surface-variant max-w-md">
          This examination has no questions associated with it yet. Please contact the system administrator to upload the questions spec.
        </p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <SecuredLayout
      onViolation={handleProctorViolation}
      onSnapshot={handleSnapshot}
      proctorActive={!!session?.webcamProctoring && !session?.isPracticeMode}
      violationsCountProp={warningCount}
    >
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-highest flex justify-between items-center px-4 md:px-margin-desktop py-2.5 border-b-4 border-secondary shadow-md">
        <div className="hidden sm:flex items-center gap-3">
          <School className="w-6 h-6 text-primary" />
          <span className="font-h4 text-lg font-bold text-primary">ExamPro</span>
        </div>
        
        <div className="hidden md:flex flex-grow flex-shrink px-4 md:px-12 flex flex-col items-center max-w-xl mx-auto">
          <h1 className="text-xs md:text-sm font-bold text-on-surface truncate w-full text-center mb-1">
            {session.title}
          </h1>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary progress-pulse" 
              style={{ width: `${(Object.keys(answers).length / session.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <Timer 
            initialSeconds={session.duration * 60} 
            onTimeUp={executeSubmission}
          />
          <Button 
            onClick={() => setShowSubmitModal(true)}
            variant="danger" 
            size="sm"
          >
            Submit Test
          </Button>
        </div>
      </header>

      {/* Main Workspace Canvas */}
      <main className="mt-28 pb-36 px-4 md:px-margin-desktop grid grid-cols-12 gap-gutter max-w-container-max mx-auto w-full flex-grow">
        
        {/* Left Card: Question Stem & Options */}
        <section className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          <QuestionCard
            question={activeQuestion}
            selectedAnswer={answers[activeQuestion.id]}
            onAnswerSelect={handleAnswerSelect}
            onShowNavigator={() => setShowNavigatorModal(true)}
          />
        </section>

        {/* Right Sidebar: Navigator grid */}
        <aside className="hidden lg:block col-span-12 lg:col-span-3">
          <div className="sticky top-28">
            <QuestionPalette
              currentQuestionIndex={currentIdx}
              states={qStates}
              questions={session.questions}
              onQuestionSelect={handleQuestionSelect}
              onShowInstructions={() => setShowInstructionsModal(true)}
            />
          </div>
        </aside>
      </main>

      {/* Bottom Control Bar */}
      <nav className="fixed bottom-0 w-full z-40 bg-surface-container-low/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-outline-variant/30 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex justify-center items-center gap-4 py-4 px-4">
        <button 
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="text-on-surface-variant px-4 md:px-6 py-2.5 rounded-xl hover:bg-surface-variant/50 transition-colors flex items-center gap-2 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-button text-sm hidden sm:inline">Previous</span>
        </button>
        
        <button 
          onClick={handleClear}
          disabled={!answers[activeQuestion.id]}
          className="text-on-surface-variant px-4 md:px-6 py-2.5 rounded-xl hover:bg-surface-variant/50 transition-colors flex items-center gap-2 active:scale-95 disabled:opacity-30"
        >
          <Trash className="w-5 h-5" />
          <span className="font-button text-sm hidden sm:inline">Clear</span>
        </button>
        
        <button 
          onClick={handleMarkForReview}
          className="text-on-surface-variant px-4 md:px-6 py-2.5 rounded-xl hover:bg-surface-variant/50 transition-colors flex items-center gap-2 active:scale-95"
        >
          <Flag className="w-5 h-5" />
          <span className="font-button text-sm hidden sm:inline">Review</span>
        </button>
        
        <Button 
          onClick={currentIdx === session.questions.length - 1 ? () => setShowSubmitModal(true) : handleNext}
          variant="gradient"
          className="scale-105"
        >
          <span className="font-button text-sm">
            {currentIdx === session.questions.length - 1 ? 'Save & Submit' : 'Save & Next'}
          </span>
          {currentIdx === session.questions.length - 1 ? (
            <CheckCircle className="w-5 h-5 ml-1" />
          ) : (
            <ChevronRight className="w-5 h-5 ml-1" />
          )}
        </Button>
      </nav>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Examination"
        size="md"
      >
        <div className="text-center space-y-4">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to finish and submit your exam? You won't be able to change your answers after submission.
          </p>
          <div className="grid grid-cols-2 gap-4 p-4 bg-surface-container rounded-2xl text-xs font-semibold text-on-surface-variant text-left">
            <div>Total Questions: {session.questions.length}</div>
            <div>Answered: {Object.keys(answers).length}</div>
            <div>Unanswered: {session.questions.length - Object.keys(answers).length}</div>
          </div>
          <div className="flex gap-4 pt-4 pb-2">
            <Button variant="outline" fullWidth onClick={() => setShowSubmitModal(false)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={executeSubmission}>Submit Test</Button>
          </div>
        </div>
      </Modal>

      {/* Guidelines / Instructions Modal */}
      <Modal
        isOpen={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        title="Examination Guidelines"
        size="lg"
      >
        <div className="space-y-4 text-xs md:text-sm text-on-surface-variant leading-relaxed">
          <p>
            <strong>Proctoring Notice:</strong> This exam is protected by advanced proctoring locks. Do not switch tabs, minimize windows, or lose focus. 3 violations will trigger an auto-submit action.
          </p>
          <p>
            <strong>Marking Scheme:</strong> Single-choice items award 4 marks for a correct response, and penalize 1 mark for incorrect responses. Multi-choice items award 8 marks with no partial points.
          </p>
          <p>
            <strong>Shortcut Keys:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1 font-mono text-xs">
            <li>Option Selection: Keys [1], [2], [3], [4]</li>
            <li>Navigation: [ArrowLeft] for Prev, [ArrowRight] for Next</li>
          </ul>
          <div className="pt-4 flex justify-end">
            <Button variant="gradient" onClick={() => setShowInstructionsModal(false)}>Resume Test</Button>
          </div>
        </div>
      </Modal>

      {/* Mobile/Tablet Navigator Modal */}
      <Modal
        isOpen={showNavigatorModal}
        onClose={() => setShowNavigatorModal(false)}
        title="Question Navigator"
        size="md"
      >
        <div className="p-1">
          <QuestionPalette
            currentQuestionIndex={currentIdx}
            states={qStates}
            questions={session.questions}
            onQuestionSelect={(idx) => {
              handleQuestionSelect(idx);
              setShowNavigatorModal(false);
            }}
            onShowInstructions={() => {
              setShowNavigatorModal(false);
              setShowInstructionsModal(true);
            }}
          />
        </div>
      </Modal>

    </SecuredLayout>
  );
};
export default ExamScreen;
