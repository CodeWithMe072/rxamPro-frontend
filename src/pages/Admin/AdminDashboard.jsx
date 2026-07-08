import React, { useEffect, useState } from 'react';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/Loader';
import { Button } from '../../components/Button';
import { LineChart, PieChart } from '../../components/Charts';
import { Users, Activity, CheckCircle, TrendingUp, AlertCircle, FileSpreadsheet, Laptop } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
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
    const fetchAnalytics = async () => {
      try {
        const data = await testService.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        toast.error('Failed to load administrative analytics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading || !analytics) {
    return <Loader size="lg" className="min-h-[60vh]" />;
  }

  const { overall, registrations, gradeDistribution } = analytics;

  const metrics = [
    { label: 'Total Enrollments', val: overall.totalEnrollments.toLocaleString(), icon: Users, color: 'text-secondary bg-secondary/15' },
    { label: 'Active Sessions', val: overall.activeUsers.toString(), icon: Activity, color: 'text-primary bg-primary/15' },
    { label: 'Completion Rate', val: `${overall.avgCompletionRate}%`, icon: CheckCircle, color: 'text-secondary bg-secondary/15' },
    { label: 'Average Score', val: `${overall.avgScore}%`, icon: TrendingUp, color: 'text-tertiary bg-tertiary/15' }
  ];

  // Chart configurations
  const registrationChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Registrations',
        data: registrations,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const gradesChartData = {
    labels: Object.keys(gradeDistribution),
    datasets: [
      {
        data: Object.values(gradeDistribution),
        backgroundColor: ['#006c49', '#2563eb', '#bc4800', '#ba1a1a', '#737686'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-8">
      {showInstallBtn && (
        <Card variant="glass" className="p-4 border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">Install ExamPro Admin App</h4>
              <p className="text-xs text-on-surface-variant">Install our lightweight dashboard application on your device for administrative operations.</p>
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
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Administrative Suite</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Monitor overall enrollment, examine analytics metrics, and manage catalog files.
        </p>
      </div>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} variant="solid" className="flex items-start justify-between">
              <div>
                <p className="text-on-surface-variant font-medium text-xs mb-1">{m.label}</p>
                <h3 className="text-2xl md:text-3xl font-bold font-mono text-on-surface">{m.val}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </Card>
          );
        })}
      </section>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Rate chart */}
        <Card variant="solid" className="lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Weekly Candidate Registrations</h3>
          </div>
          <div className="h-64">
            <LineChart data={registrationChartData} />
          </div>
        </Card>

        {/* Grade Distribution Chart */}
        <Card variant="solid" className="lg:col-span-1 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Grade Spread Distribution</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            <PieChart data={gradesChartData} />
          </div>
        </Card>
      </section>

      {/* Recent Alerts / Audit log */}
      <section>
        <Card variant="solid">
          <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/20 pb-3">
            <FileSpreadsheet className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">Recent Activity Logs</h3>
          </div>
          
          <div className="divide-y divide-outline-variant/20 text-xs text-on-surface-variant">
            {analytics.recentAttempts && analytics.recentAttempts.length > 0 ? (
              analytics.recentAttempts.map((att) => (
                <div key={att.id} className="py-3 flex justify-between items-center gap-4">
                  <span className="text-on-surface-variant">Candidate <strong className="text-on-surface">{att.candidateName}</strong> completed exam: <em>{att.testTitle}</em> with score <strong className="text-on-surface">{att.score}</strong> (Accuracy: <strong className="text-on-surface">{att.accuracy}%</strong>)</span>
                  <span className="text-on-surface-variant/60 font-mono whitespace-nowrap">{new Date(att.date).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <div className="py-3 text-on-surface-variant/60 text-center">No recent examination activity logs available.</div>
            )}
          </div>
        </Card>
      </section>

    </div>
  );
};
export default AdminDashboard;
