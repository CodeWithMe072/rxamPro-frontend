import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Progress } from '../../components/Progress';
import { Loader } from '../../components/Loader';
import { 
  BookOpen, CheckSquare, Award, TrendingUp, 
  HelpCircle, Timer, FileText, ArrowRight, Sigma,
  ChevronLeft, ChevronRight, Laptop,
  History, Calendar, ArrowUpRight, Trophy, ClipboardCheck
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInstallBtn, setShowInstallBtn] = useState(!!window.deferredPrompt);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleInstallable = () => {
      setShowInstallBtn(true);
    };
    window.addEventListener('pwa-installable', handleInstallable);
    return () => window.removeEventListener('pwa-installable', handleInstallable);
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      console.log('User installed the web app');
    }
    window.deferredPrompt = null;
    setShowInstallBtn(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, attemptsData, statsData] = await Promise.all([
          testService.getAvailableTests(),
          testService.getPreviousAttempts(),
          testService.getStudentDashboard()
        ]);
        const activeTests = (testsData.data || []).filter(test => {
          const startDateObj = test.startDate ? new Date(test.startDate) : null;
          const endDateObj = test.endDate ? new Date(test.endDate) : null;
          const isClosed = endDateObj && endDateObj < new Date();
          return !isClosed;
        });
        setTests(activeTests.slice(0, 3)); // show top 3 active tests
        setAttempts(attemptsData.data);
        setDashboardStats(statsData);
      } catch (error) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !dashboardStats) {
    return <Loader size="lg" className="min-h-[60vh]" />;
  }

  const handleScroll = (direction) => {
    const container = document.getElementById('metrics-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const metrics = [
    { label: 'Total Tests',    val: dashboardStats.totalTests.toString(),   icon: BookOpen,    color: 'text-primary bg-primary/10' },
    { label: 'Attempted',      val: dashboardStats.attemptedCount.toString(), icon: CheckSquare, color: 'text-secondary bg-secondary/10' },
    { label: 'Tests Submitted', val: (dashboardStats.submittedCount || 0).toString(), icon: FileText, color: 'text-tertiary bg-tertiary/10' },
    { label: 'Average Score',  val: dashboardStats.averageScore,             icon: TrendingUp,  color: 'text-tertiary bg-tertiary/10' },
    { label: 'Best Score',     val: dashboardStats.bestScore,                icon: Award,       color: 'text-primary bg-primary/10' },
    {
      label: 'Marks Gained',
      val: `${dashboardStats.totalGainedMarks} / ${dashboardStats.totalPossibleMarks}`,
      icon: Sigma,
      color: 'text-secondary bg-secondary/10'
    }
  ];

  return (
    <div className="space-y-8">
      {showInstallBtn && (
        <Card variant="glass" className="p-4 border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">Install ExamPro Web App</h4>
              <p className="text-xs text-on-surface-variant">Install our lightweight application on your device for a fast, distraction-free examination experience.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handleInstallClick} variant="gradient" size="sm" className="w-full sm:w-auto cursor-pointer">
              Install App
            </Button>
            <Button onClick={() => setShowInstallBtn(false)} variant="outline" size="sm" className="w-full sm:w-auto text-on-surface-variant cursor-pointer">
              Dismiss
            </Button>
          </div>
        </Card>
      )}
      
      {/* Metrics Row Container */}
      <div className="relative group/scroll px-2">
        {/* Left Arrow Button */}
        <button 
          onClick={() => handleScroll('left')}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface-container-high/90 dark:bg-slate-800/90 hover:bg-surface-container dark:hover:bg-slate-700 text-on-surface flex items-center justify-center border border-outline-variant/30 shadow-lg cursor-pointer opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300 focus:outline-none"
          title="Scroll Left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div 
          id="metrics-container"
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2"
        >
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <Card 
                key={idx} 
                variant="glass" 
                className="flex items-start justify-between min-w-[240px] sm:min-w-[260px] flex-shrink-0 flex-grow"
              >
                <div>
                  <p className="text-on-surface-variant font-medium text-xs mb-1">{m.label}</p>
                  <h3 className="font-h2 text-2xl md:text-3xl font-bold text-on-surface">{m.val}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button 
          onClick={() => handleScroll('right')}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface-container-high/90 dark:bg-slate-800/90 hover:bg-surface-container dark:hover:bg-slate-700 text-on-surface flex items-center justify-center border border-outline-variant/30 shadow-lg cursor-pointer opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300 focus:outline-none"
          title="Scroll Right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Available Exams Matrix */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-h3 text-xl md:text-2xl font-bold text-on-surface">Available Examinations</h2>
          <Link to="/tests" className="text-primary dark:text-primary-fixed font-button text-sm flex items-center gap-1.5 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {tests.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center border-2 border-dashed border-outline-variant/40">
              <BookOpen className="w-9 h-9 text-on-surface-variant/40" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="font-bold text-base text-on-surface">No Tests Available Right Now</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                There are no active examinations assigned to you at the moment. Check back later or contact your administrator.
              </p>
            </div>
            <Link
              to="/tests"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mt-1"
            >
              Browse all tests <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <Card
                key={test.id}
                variant="glass"
                className="overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col p-0 border-outline-variant/20"
              >
                {/* Color Stripe indicator */}
                <div className={`h-3 w-full ${
                  test.color === 'secondary' || test.difficulty === 'Medium' ? 'bg-secondary' : test.color === 'tertiary' || test.difficulty === 'Easy' ? 'bg-tertiary' : 'bg-primary'
                }`} />

                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-h4 text-base md:text-lg font-bold text-on-surface leading-tight truncate">
                      {test.title}
                    </h4>
                    <p className="text-on-surface-variant text-xs mt-1 font-medium truncate">{test.category}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-outline" /> {test.questionsCount} Qs
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5 text-outline" /> {test.duration} Min
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-outline" /> {test.totalMarks} Marks
                    </Badge>
                  </div>

                  {(() => {
                    const startDateObj = test.startDate ? new Date(test.startDate) : null;
                    const endDateObj = test.endDate ? new Date(test.endDate) : null;

                    if (!startDateObj && !endDateObj) {
                      return (
                        <div className="text-[10px] text-secondary bg-secondary/5 p-2 rounded-lg border border-secondary/10 font-semibold text-center">
                          Always Open
                        </div>
                      );
                    }

                    const isOpen = (!startDateObj || startDateObj <= now) && (!endDateObj || endDateObj >= now);
                    const isUpcoming = startDateObj && startDateObj > now;
                    const isClosed = endDateObj && endDateObj < now;

                    return (
                      <div className="text-[10px] text-on-surface-variant bg-surface-container-low/50 p-2 rounded-lg border border-outline-variant/10 space-y-1 font-medium">
                        {isOpen && (
                          <div className="text-secondary font-bold text-center flex items-center justify-center gap-1.5 py-0.5 bg-secondary/10 rounded border border-secondary/20 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> Open Now
                          </div>
                        )}
                        {isUpcoming && startDateObj && (
                          <div>Opens: <strong className="text-on-surface font-mono">{startDateObj.toLocaleString()}</strong></div>
                        )}
                        {isClosed && endDateObj && (
                          <div className="text-error font-bold text-center py-0.5 bg-error/10 rounded border border-error/20 uppercase tracking-wider">Closed</div>
                        )}
                        {endDateObj && !isClosed && (
                          <div>Closes: <strong className="text-on-surface font-mono">{endDateObj.toLocaleString()}</strong></div>
                        )}
                      </div>
                    );
                  })()}

                  <Button
                    onClick={() => navigate(`/tests/${test.id}`)}
                    variant={test.color === 'secondary' || test.difficulty === 'Medium' ? 'solid' : test.color === 'tertiary' || test.difficulty === 'Easy' ? 'solid' : 'gradient'}
                    className={`w-full ${
                      (test.color === 'secondary' || test.difficulty === 'Medium') ? 'bg-secondary hover:opacity-90' : (test.color === 'tertiary' || test.difficulty === 'Easy') ? 'bg-tertiary hover:opacity-90' : ''
                    }`}
                  >
                    Start Test
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ── Recent Attempts ──────────────────────────────────────────────── */}
      {attempts && attempts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center">
                <History className="w-4 h-4 text-secondary" />
              </div>
              <h2 className="font-h3 text-xl md:text-2xl font-bold text-on-surface">Recent Attempts</h2>
            </div>
            <Link to="/attempts" className="text-primary dark:text-primary-fixed font-button text-sm flex items-center gap-1.5 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Desktop table */}
          <Card variant="glass" className="p-0 overflow-hidden border-outline-variant/20 hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant/30 text-on-surface-variant font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-6">Examination</th>
                  <th className="py-3 px-6 text-center">Score</th>
                  <th className="py-3 px-6 text-center">Accuracy</th>
                  <th className="py-3 px-6 text-center">Date</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {attempts.slice(0, 3).map((att) => (
                  <tr key={att.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <ClipboardCheck className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-semibold text-on-surface truncate max-w-[220px]">{att.testTitle}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className="font-mono font-bold text-primary dark:text-primary-fixed">
                        {att.score} / {att.totalMarks}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`font-mono font-bold ${
                        att.accuracy >= 75 ? 'text-secondary' :
                        att.accuracy >= 50 ? 'text-tertiary' : 'text-error'
                      }`}>{att.accuracy}%</span>
                    </td>
                    <td className="py-3.5 px-6 text-center text-on-surface-variant text-xs font-medium">
                      <span className="flex items-center justify-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-outline" />
                        {format(new Date(att.date), 'MMM dd, yyyy')}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => navigate(`/results/summary?attemptId=${att.id}`)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {attempts.slice(0, 3).map((att) => (
              <Card key={att.id} variant="glass" className="p-4 border-outline-variant/20">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-bold text-on-surface text-sm leading-tight max-w-[70%]">{att.testTitle}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    att.accuracy >= 75 ? 'bg-secondary/10 text-secondary' :
                    att.accuracy >= 50 ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                  }`}>{att.accuracy}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> {att.score}/{att.totalMarks}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {format(new Date(att.date), 'MMM dd, yyyy')}
                  </span>
                  <button
                    onClick={() => navigate(`/results/summary?attemptId=${att.id}`)}
                    className="flex items-center gap-1 text-primary font-bold hover:underline cursor-pointer"
                  >
                    Details <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
export default StudentDashboard;
