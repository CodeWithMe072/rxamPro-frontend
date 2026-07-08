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
  ChevronLeft, ChevronRight, Laptop
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showInstallBtn, setShowInstallBtn] = useState(!!window.deferredPrompt);

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
        setTests(testsData.slice(0, 3)); // show top 3 tests
        setAttempts(attemptsData);
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
      </section>

      {/* Certification milestone banner */}
      <section>
        <Card variant="glass" className="overflow-hidden border-primary/10">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between p-2">
            <div className="flex-grow space-y-4 text-center md:text-left">
              <span className="inline-block bg-primary/10 text-primary dark:text-primary-fixed px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Upcoming Milestone
              </span>
              <h2 className="font-h2 text-xl md:text-2xl font-bold text-on-surface">Certification in Neural Networks</h2>
              <p className="text-on-surface-variant text-sm max-w-xl leading-relaxed">
                You've completed 4 of 6 required modules. Complete the remaining two tests this week to unlock your digital certificate and shareable badge.
              </p>
              
              <div className="space-y-2 max-w-md mx-auto md:mx-0">
                <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                  <span>Overall Progress</span>
                  <span className="text-primary dark:text-primary-fixed">66%</span>
                </div>
                <Progress value={66} pulse />
              </div>
            </div>

            <div className="flex-shrink-0 w-36 h-36 md:w-44 md:h-44 bg-primary/5 rounded-full flex items-center justify-center border-2 border-dashed border-primary/20">
              <Award className="w-20 h-20 text-primary/30 dark:text-primary-fixed-dim/30" />
            </div>
          </div>
        </Card>
      </section>

    </div>
  );
};
export default StudentDashboard;
