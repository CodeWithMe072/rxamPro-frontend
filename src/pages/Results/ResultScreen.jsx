import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Progress } from '../../components/Progress';
import { Loader } from '../../components/Loader';
import { testService } from '../../services/test.service';
import { useAuth } from '../../context/AuthContext';
import { 
  Trophy, CheckCircle, XCircle, 
  Clock, Award, Home, Search, Printer, School 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ResultScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: activeUser } = useAuth();
  const attemptId = searchParams.get('attemptId') || location.state?.results?.sessionId || location.state?.results?.id;
  const justCompleted = location.state?.justCompleted || false;

  const [detailedResults, setDetailedResults] = useState(
    location.state?.results?.answersSummary ? location.state.results : null
  );
  const [isLoading, setIsLoading] = useState(!!attemptId && !detailedResults);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewFilter, setReviewFilter] = useState('correct');

  const isStaff = ['admin', 'sub-admin', 'staff'].includes(activeUser?.role);

  useEffect(() => {
    if (attemptId && !detailedResults) {
      const fetchResult = async () => {
        try {
          setIsLoading(true);
          const data = await testService.getAttemptResult(attemptId);
          setDetailedResults(data);
        } catch (error) {
          console.error(error);
          toast.error('Failed to load detailed scorecard.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchResult();
    }
  }, [attemptId, detailedResults]);

  const handleRevealAnswers = async () => {
    if (!window.confirm("Are you sure you want to reveal the correct answers? Under penalty rules, any future attempts of this test will be marked as practice mode and will not count towards your score statistics.")) {
      return;
    }

    const loadId = toast.loading('Revealing correct answers...');
    try {
      await testService.revealAnswers(attemptId);
      toast.success('Answer key revealed successfully!', { id: loadId });
      
      // Re-fetch result scorecard so correct answers are loaded securely
      const data = await testService.getAttemptResult(attemptId);
      setDetailedResults(data);
    } catch (e) {
      toast.error('Failed to reveal answer key.', { id: loadId });
    }
  };

  const handleDownloadPDF = async () => {
    const loadId = toast.loading('Generating official performance report PDF...');
    try {
      const response = await testService.downloadResultPDF(attemptId);
      const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Scorecard_${attemptId || 'report'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Performance report downloaded successfully!', { id: loadId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to download official PDF. Falling back to print...', { id: loadId });
      window.print();
    }
  };

  if (isLoading) {
    return <Loader size="lg" className="min-h-[60vh]" />;
  }

  // Fallback demo results if navigated directly with no attemptId
  const demoResults = detailedResults || {
    score: 182,
    totalMarks: 240,
    correctCount: 47,
    wrongCount: 6,
    unansweredCount: 7,
    accuracy: 89,
    durationMinutes: 118,
    grade: 'B',
    categoryAnalysis: [
      {
        category: 'Quantum Mechanics',
        totalQuestions: 30,
        attempted: 27,
        correct: 25,
        wrong: 2,
        skipped: 3,
        accuracy: 92
      },
      {
        category: 'Hamiltonian Operators',
        totalQuestions: 15,
        attempted: 13,
        correct: 12,
        wrong: 1,
        skipped: 2,
        accuracy: 92
      },
      {
        category: 'Schrödinger Equations',
        totalQuestions: 15,
        attempted: 13,
        correct: 10,
        wrong: 3,
        skipped: 2,
        accuracy: 76
      }
    ],
    answersSummary: [
      {
        number: 42,
        text: "Considering the schematic below representing the probability density of a particle in a one-dimensional infinite potential well of width 'L', identify the quantum state (n) and the corresponding energy level associated with this specific wavefunction distribution.",
        correct: "C",
        selected: "C",
        isCorrect: true
      },
      {
        number: 1,
        text: "Evaluate the characteristic eigenvalues of the Hamiltonian Operators operator under boundary conditions defined for state index #1. Assume a perturbation parameter λ is infinitesimally small.",
        correct: "B",
        selected: "A",
        isCorrect: false
      },
      {
        number: 2,
        text: "Evaluate the characteristic eigenvalues of the Schrödinger Equations operator under boundary conditions defined for state index #2.",
        correct: "A",
        selected: "A",
        isCorrect: true
      }
    ]
  };

  const stats = [
    { label: 'Score Earned', val: `${demoResults.score} / ${demoResults.totalMarks}`, icon: Award, color: 'text-primary' },
    { label: 'Time Spent', val: `${demoResults.durationMinutes} Mins`, icon: Clock, color: 'text-tertiary' },
    { label: 'Accuracy', val: `${demoResults.accuracy}%`, icon: Trophy, color: 'text-secondary' },
    { label: 'Grade Awarded', val: demoResults.grade, icon: CheckCircle, color: 'text-primary-fixed-dim' }
  ];

  const answersList = demoResults.answersSummary || [];
  const allCount = answersList.length;
  const correctCount = answersList.filter(item => item.isCorrect).length;
  const wrongCount = answersList.filter(item => !item.isCorrect && item.selected !== 'None' && item.selected !== 'skipped' && item.selected !== '').length;
  const missedCount = answersList.filter(item => item.selected === 'None' || item.selected === 'skipped' || item.selected === '').length;

  const filteredAnswers = answersList.filter(item => {
    if (reviewFilter === 'correct') return item.isCorrect;
    if (reviewFilter === 'wrong') return !item.isCorrect && item.selected !== 'None' && item.selected !== 'skipped' && item.selected !== '';
    if (reviewFilter === 'missed') return item.selected === 'None' || item.selected === 'skipped' || item.selected === '';
    return true; // 'all'
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Welcome Banner */}
      <section className="text-center space-y-3 print:hidden">
        <div className="w-16 h-16 bg-secondary/10 border border-secondary/20 rounded-2xl text-secondary flex items-center justify-center mx-auto mb-2 floating-animation">
          <Trophy className="w-9 h-9" />
        </div>
        <h1 className="font-h3 text-2xl md:text-3xl font-bold text-on-surface">Examination Summary</h1>
        <p className="font-body text-sm text-on-surface-variant max-w-md mx-auto">
          Your answers have been graded. Review your performance analytics and scorecard detail below.
        </p>
      </section>

      {/* Practice Mode Banner */}
      {demoResults.isPracticeMode && (
        <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl flex items-start gap-3 print:hidden">
          <Trophy className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-secondary">Practice/Learning Attempt</h4>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              This attempt was made in **Practice Mode** because the test's answer key was revealed. The score achieved here has been saved to your history but **does not count** toward your profile totals or global leaderboard standings.
            </p>
          </div>
        </div>
      )}

      {/* Student Action: Reveal Answer Key Banner */}
      {!isStaff && justCompleted && !detailedResults?.answerKeyActive && (
        <Card variant="glass" className="p-5 border border-dashed border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container/30 print:hidden">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm font-bold text-on-surface">Reveal Answer Key?</h4>
            <p className="text-xs text-on-surface-variant max-w-lg leading-relaxed font-normal">
              You can choose to reveal the correct answers for this assessment. **Penalty Notice:** Once revealed, any future attempts on this specific test will run in **Practice Mode** only and will **not count** toward leaderboard scores or profile stats.
            </p>
          </div>
          <Button onClick={handleRevealAnswers} variant="gradient" size="sm" className="px-6 h-10 font-bold whitespace-nowrap">
            Reveal Answers
          </Button>
        </Card>
      )}

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Card key={idx} variant="glass" className="text-center flex flex-col items-center p-6 border-white/20">
              <Icon className={`w-8 h-8 ${s.color} mb-3`} />
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{s.label}</p>
              <h3 className="text-xl font-bold text-on-surface mt-1 font-mono">{s.val}</h3>
            </Card>
          );
        })}
      </section>

      {/* Tabs Selector Navigation */}
      <div className="flex border-b border-outline-variant/30 font-bold text-xs uppercase tracking-wider text-on-surface-variant gap-6 pt-4 print:hidden">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-all relative font-extrabold focus:outline-none cursor-pointer ${
            activeTab === 'overview' 
              ? 'text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-primary-fixed' 
              : 'hover:text-on-surface'
          }`}
        >
          Overview Review
        </button>
        <button
          onClick={() => setActiveTab('category')}
          className={`pb-3 transition-all relative font-extrabold focus:outline-none cursor-pointer ${
            activeTab === 'category' 
              ? 'text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-primary-fixed' 
              : 'hover:text-on-surface'
          }`}
        >
          Category Analysis
        </button>
        {isStaff && demoResults.snapshots && demoResults.snapshots.length > 0 && (
          <button
            onClick={() => setActiveTab('proctoring')}
            className={`pb-3 transition-all relative font-extrabold focus:outline-none cursor-pointer ${
              activeTab === 'proctoring' 
                ? 'text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-primary-fixed' 
                : 'hover:text-on-surface'
            }`}
          >
            Proctoring Logs ({demoResults.snapshots.length})
          </button>
        )}
      </div>

      {/* Tabs Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn print:hidden">
          {/* Breakdown bar */}
          <section>
            <Card variant="glass" className="p-6 border-white/20">
              <h3 className="font-h4 text-sm font-bold text-on-surface-variant mb-4 uppercase tracking-wider">Responses Breakdown</h3>
              <div className="flex h-4 rounded-full overflow-hidden w-full mb-4">
                <div className="h-full bg-secondary" style={{ width: `${(demoResults.correctCount / (demoResults.correctCount + demoResults.wrongCount + demoResults.unansweredCount)) * 100}%` }} title="Correct" />
                <div className="h-full bg-error" style={{ width: `${(demoResults.wrongCount / (demoResults.correctCount + demoResults.wrongCount + demoResults.unansweredCount)) * 100}%` }} title="Incorrect" />
                <div className="h-full bg-outline-variant/30" style={{ width: `${(demoResults.unansweredCount / (demoResults.correctCount + demoResults.wrongCount + demoResults.unansweredCount)) * 100}%` }} title="Unanswered" />
              </div>
              <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-secondary" /> {demoResults.correctCount} Correct</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-error" /> {demoResults.wrongCount} Incorrect</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-outline-variant/40" /> {demoResults.unansweredCount} Unanswered</span>
              </div>
            </Card>
          </section>

          {/* Question Details Review */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-outline-variant/20">
              <h2 className="font-h3 text-xl font-bold text-on-surface">Itemized Review</h2>
              
              {/* Sub-tabs filter selection */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setReviewFilter('correct')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none cursor-pointer flex items-center gap-1.5 ${
                    reviewFilter === 'correct'
                      ? 'bg-secondary text-white shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  Correct <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${reviewFilter === 'correct' ? 'bg-white/20 text-white' : 'bg-outline-variant/30 text-on-surface-variant'}`}>{correctCount}</span>
                </button>
                <button
                  onClick={() => setReviewFilter('wrong')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none cursor-pointer flex items-center gap-1.5 ${
                    reviewFilter === 'wrong'
                      ? 'bg-error text-white shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  Wrong <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${reviewFilter === 'wrong' ? 'bg-white/20 text-white' : 'bg-outline-variant/30 text-on-surface-variant'}`}>{wrongCount}</span>
                </button>
                <button
                  onClick={() => setReviewFilter('missed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none cursor-pointer flex items-center gap-1.5 ${
                    reviewFilter === 'missed'
                      ? 'bg-outline-variant text-on-surface shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  Missed <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${reviewFilter === 'missed' ? 'bg-white/20 text-white' : 'bg-outline-variant/30 text-on-surface-variant'}`}>{missedCount}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAnswers.length > 0 ? (
                filteredAnswers.map((item, idx) => (
                  <Card 
                    key={idx} 
                    variant="glass" 
                    className={`border-l-4 p-6 ${
                      item.isCorrect ? 'border-l-secondary' : (item.selected === 'None' || item.selected === 'skipped' || item.selected === '') ? 'border-l-outline-variant' : 'border-l-error'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-xs font-bold text-primary">Question {item.number}</span>
                      <Badge variant={item.isCorrect ? 'secondary' : (item.selected === 'None' || item.selected === 'skipped' || item.selected === '') ? 'outline' : 'error'}>
                        {item.isCorrect ? 'Correct' : (item.selected === 'None' || item.selected === 'skipped' || item.selected === '') ? 'Unanswered' : 'Incorrect'}
                      </Badge>
                    </div>
                    <p className="font-body text-sm text-on-surface mt-3 leading-relaxed">
                      {item.text}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-outline-variant/20 text-xs">
                      <div className={`p-3 rounded-lg bg-surface-container/50 ${!item.correct ? 'sm:col-span-2' : ''}`}>
                        <span className="text-on-surface-variant block mb-1 font-bold">Your Response:</span>
                        <span className={`font-semibold flex items-center gap-1.5 ${item.isCorrect ? 'text-secondary' : (item.selected === 'None' || item.selected === 'skipped' || item.selected === '') ? 'text-on-surface-variant' : 'text-error'}`}>
                          {item.isCorrect ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (item.selected === 'None' || item.selected === 'skipped' || item.selected === '') ? (
                            <span className="text-xs text-on-surface-variant/60">Not Attempted</span>
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Option {item.selected}
                        </span>
                      </div>
                      {item.correct && (
                        <div className="p-3 rounded-lg bg-surface-container/50">
                          <span className="text-on-surface-variant block mb-1 font-bold">Correct Answer:</span>
                          <span className="font-semibold text-secondary flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            Option {item.correct}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-12 text-center text-on-surface-variant bg-surface-container/30 border border-dashed border-outline-variant/30 rounded-2xl font-bold text-sm">
                  No questions found matching the selected filter.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'category' && (
        <section className="space-y-4 animate-fadeIn print:hidden">
          <h2 className="font-h3 text-xl font-bold text-on-surface">Subject-Wise Analysis</h2>
          {demoResults.categoryAnalysis && demoResults.categoryAnalysis.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoResults.categoryAnalysis.map((cat, idx) => {
                const needsImprovement = cat.accuracy < 50;
                return (
                  <Card 
                    key={idx} 
                    variant="glass" 
                    className={`p-6 border-white/20 flex flex-col justify-between space-y-4 relative overflow-hidden ${
                      needsImprovement ? 'border-l-4 border-l-error' : 'border-l-4 border-l-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-on-surface text-base">{cat.category}</h4>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-1">Topic Section</p>
                      </div>
                      <Badge variant={needsImprovement ? 'error' : 'secondary'}>
                        {needsImprovement ? 'Needs Focus' : 'Strong'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                        <span>Topic Accuracy</span>
                        <span className={needsImprovement ? 'text-error' : 'text-secondary'}>{cat.accuracy}%</span>
                      </div>
                      <Progress value={cat.accuracy} variant={needsImprovement ? 'error' : 'secondary'} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-on-surface-variant pt-2 border-t border-outline-variant/10">
                      <div>
                        <span className="block text-on-surface-variant">Correct</span>
                        <span className="text-xs font-semibold text-secondary">{cat.correct || 0} Qs</span>
                      </div>
                      <div>
                        <span className="block text-on-surface-variant">Incorrect</span>
                        <span className="text-xs font-semibold text-error">{cat.wrong || 0} Qs</span>
                      </div>
                      <div>
                        <span className="block text-on-surface-variant">Skipped</span>
                        <span className="text-xs font-semibold text-on-surface-variant/70">{cat.skipped || 0} Qs</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card variant="glass" className="p-12 text-center text-on-surface-variant">
              No category-wise analytics available for this attempt.
            </Card>
          )}
        </section>
      )}

      {activeTab === 'proctoring' && isStaff && demoResults.snapshots && (
        <section className="space-y-6 animate-fadeIn print:hidden">
          <Card variant="glass" className="p-6 border-white/20">
            <h3 className="font-h3 text-lg font-bold text-on-surface mb-1">
              Captured Proctoring Snapshots
            </h3>
            <p className="text-xs text-on-surface-variant mb-6 font-medium">
              Webcam snapshot monitoring captures for candidate: <strong>{demoResults.candidateName || 'Candidate'}</strong> ({demoResults.candidateEmail})
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {demoResults.snapshots.map((snap, idx) => (
                <div key={idx} className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/20">
                  <img 
                    src={snap.image} 
                    alt={`Proctoring Snapshot ${idx + 1}`} 
                    className="w-full h-44 object-cover" 
                  />
                  <div className="p-3 text-[10px] font-semibold text-on-surface-variant">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-error uppercase tracking-wider">{snap.reason}</span>
                      <span className="font-mono">{new Date(snap.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Navigation actions */}
      <section className="flex flex-wrap gap-4 justify-center pt-4 print:hidden">
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
          <Home className="w-4 h-4" /> Back to Dashboard
        </Button>
        <Button variant="gradient" onClick={handleDownloadPDF} className="flex items-center gap-2">
          <Printer className="w-4 h-4" /> Download PDF Report
        </Button>
        <Button variant="outline" onClick={() => navigate('/tests')} className="flex items-center gap-2">
          <Search className="w-4 h-4" /> Explore More Tests
        </Button>
      </section>

      {/* Print-only Official Scorecard Report (Rendered only on print / PDF download) */}
      <div className="hidden print:block print-container bg-white text-slate-900 p-12 border-8 border-slate-100 relative min-h-[1050px] font-sans">
        {/* Background Watermark decoration */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <Trophy className="w-96 h-96 text-slate-950" />
        </div>

        {/* Header Block */}
        <div className="border-b-4 border-primary pb-6 mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xl uppercase tracking-wider mb-1">
              <School className="w-6 h-6" /> ExamPro
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 uppercase">Official Performance Report</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">Verified Assessment Certificate</p>
          </div>
          <div className="px-4 py-2 bg-secondary/10 border-2 border-secondary rounded-xl text-secondary text-center">
            <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-500">Performance Status</span>
            <span className="text-sm font-extrabold uppercase">
              {demoResults.accuracy >= 90 ? 'Distinction' : demoResults.accuracy >= 80 ? 'Excellent' : demoResults.accuracy >= 50 ? 'Passed' : 'Needs Focus'}
            </span>
          </div>
        </div>

        {/* Candidate Detail Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">Candidate Name</span>
            <span className="text-base font-bold text-slate-800">{activeUser?.name || 'Sanjay Chouhan'}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">Candidate Email</span>
            <span className="text-base font-bold text-slate-800">{activeUser?.email || 'sanjay.chouhan@exampro.com'}</span>
          </div>
          <div className="pt-2">
            <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">Examination Reference ID</span>
            <span className="text-base font-bold text-slate-800 font-mono">{attemptId || 'PRO-MOCK-SESSION'}</span>
          </div>
          <div className="pt-2">
            <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">Date of Evaluation</span>
            <span className="text-base font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">Score Achieved</span>
            <span className="text-xl font-bold text-primary font-mono">{demoResults.score} / {demoResults.totalMarks}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">Section Accuracy</span>
            <span className="text-xl font-bold text-secondary font-mono">{demoResults.accuracy}%</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">Evaluation Result</span>
            <span className={`text-xl font-bold font-mono ${demoResults.accuracy >= 50 ? 'text-secondary' : 'text-error'}`}>
              {demoResults.accuracy >= 50 ? 'PASSED' : 'FAILED'}
            </span>
          </div>
        </div>

        {/* Detailed Category Analysis table */}
        <div className="mb-12">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Subject-Wise Breakdown</h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4">Subject Domain</th>
                <th className="py-2.5 px-4 text-center">Total Questions</th>
                <th className="py-2.5 px-4 text-center">Correct</th>
                <th className="py-2.5 px-4 text-center">Incorrect</th>
                <th className="py-2.5 px-4 text-center">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {demoResults.categoryAnalysis && demoResults.categoryAnalysis.map((cat, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-bold">{cat.category}</td>
                  <td className="py-3 px-4 text-center font-mono">{cat.totalQuestions || (cat.correct + cat.wrong + cat.skipped)}</td>
                  <td className="py-3 px-4 text-center font-mono text-secondary">{cat.correct}</td>
                  <td className="py-3 px-4 text-center font-mono text-error">{cat.wrong}</td>
                  <td className="py-3 px-4 text-center font-bold font-mono text-slate-800">{cat.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Footer Verification Block */}
        <div className="absolute bottom-12 left-12 right-12 border-t-2 border-slate-200 pt-8 grid grid-cols-2 gap-8 items-end">
          <div>
            <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">Security Verification</span>
            <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
              This document is officially signed and generated by the ExamPro grading engine. Score validity can be verified online at <strong>verify.exampro.com/assessments/{attemptId || 'PRO-MOCK-SESSION'}</strong>.
            </p>
          </div>
          <div className="flex justify-between items-center border-l border-slate-200 pl-8">
            <div>
              <span className="font-mono text-xs font-bold text-slate-700 block italic leading-none">ExamPro Board</span>
              <div className="h-0.5 bg-slate-300 w-32 my-1.5" />
              <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">Chief Examiner Signature</span>
            </div>
            {/* Mock QR verification container */}
            <div className="w-16 h-16 bg-slate-100 border border-slate-300 p-1 flex items-center justify-center rounded">
              <div className="w-full h-full bg-slate-800" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '6px 6px' }}></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResultScreen;
