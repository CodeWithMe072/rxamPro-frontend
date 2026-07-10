import React, { useEffect, useState } from 'react';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/Loader';
import { BarChart, LineChart } from '../../components/Charts';
import { BookOpen, AlertCircle, Percent, BarChart4 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AnalyticsPanel = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await testService.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        toast.error('Failed to retrieve analytical reports.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading || !analytics) {
    return <Loader size="lg" className="min-h-[60vh]" />;
  }

  const { overall, difficultyStats, gradeDistribution } = analytics;

  // Chart configuration
  const subjectLabels = analytics.subjectPerformance?.map(sp => sp.subject) || [];
  const subjectScores = analytics.subjectPerformance?.map(sp => sp.avgPct) || [];

  const performanceChartData = {
    labels: subjectLabels,
    datasets: [
      {
        label: 'Average Score (%)',
        data: subjectScores,
        backgroundColor: '#006c49',
        borderRadius: 6
      }
    ]
  };

  const difficultyChartData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Avg Score By Difficulty',
        data: [
          difficultyStats.easy.avgScore,
          difficultyStats.medium.avgScore,
          difficultyStats.hard.avgScore
        ],
        borderColor: '#943700',
        backgroundColor: 'rgba(148, 55, 0, 0.05)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  return (
    <div className="space-y-8 text-on-background">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Analytics Panel</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Analyze item-level difficulties, grade distributions, and performance graphs.
        </p>
      </div>

      {/* Overview stats cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card variant="solid" className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-on-surface-variant/80 text-xs uppercase font-bold tracking-wider">Total Modules</p>
            <h3 className="text-xl font-bold font-mono mt-1 text-on-surface">{overall.totalTests || 0} Exams</h3>
          </div>
        </Card>
        <Card variant="solid" className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-on-surface-variant/80 text-xs uppercase font-bold tracking-wider">Average Accuracy</p>
            <h3 className="text-xl font-bold font-mono mt-1 text-on-surface">{(overall.avgAccuracy || 0).toFixed(1)}%</h3>
          </div>
        </Card>
        <Card variant="solid" className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
            <BarChart4 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-on-surface-variant/80 text-xs uppercase font-bold tracking-wider">Participation Rate</p>
            <h3 className="text-xl font-bold font-mono mt-1 text-on-surface">{overall.participationRate || 0}%</h3>
          </div>
        </Card>
      </section>

      {/* Analytics Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance by Subject */}
        <Card variant="solid" className="p-6">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Subject-Level Performance Analysis</h3>
          </div>
          <div className="h-64">
            <BarChart data={performanceChartData} />
          </div>
        </Card>

        {/* Difficulty Correlation */}
        <Card variant="solid" className="p-6">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Difficulty Grade Correlation</h3>
          </div>
          <div className="h-64">
            <LineChart data={difficultyChartData} />
          </div>
        </Card>

      </section>

      {/* Itemized stats table */}
      <section>
        <Card variant="solid" className="p-0 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Grade Spread Audit</h3>
          </div>
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant/20 text-on-surface-variant font-bold uppercase tracking-wider">
                <th className="py-4 px-6 text-center">Grade</th>
                <th className="py-4 px-6 text-center">Frequency (%)</th>
                <th className="py-4 px-6 text-center">Standard Deviations</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              <tr className="hover:bg-surface-variant/10">
                <td className="py-4 px-6 text-center font-bold text-on-surface">A</td>
                <td className="py-4 px-6 text-center font-mono text-on-surface">{gradeDistribution.A}%</td>
                <td className="py-4 px-6 text-center font-mono text-on-surface-variant">+1.2σ</td>
                <td className="py-4 px-6 text-center"><Badge variant="secondary">Excellent</Badge></td>
              </tr>
              <tr className="hover:bg-surface-variant/10">
                <td className="py-4 px-6 text-center font-bold text-on-surface">B</td>
                <td className="py-4 px-6 text-center font-mono text-on-surface">{gradeDistribution.B}%</td>
                <td className="py-4 px-6 text-center font-mono text-on-surface-variant">+0.4σ</td>
                <td className="py-4 px-6 text-center"><Badge variant="primary">Above Avg</Badge></td>
              </tr>
              <tr className="hover:bg-surface-variant/10">
                <td className="py-4 px-6 text-center font-bold text-on-surface">C</td>
                <td className="py-4 px-6 text-center font-mono text-on-surface">{gradeDistribution.C}%</td>
                <td className="py-4 px-6 text-center font-mono text-on-surface-variant">-0.2σ</td>
                <td className="py-4 px-6 text-center"><Badge variant="tertiary">Average</Badge></td>
              </tr>
              <tr className="hover:bg-surface-variant/10">
                <td className="py-4 px-6 text-center font-bold text-on-surface">D</td>
                <td className="py-4 px-6 text-center font-mono text-on-surface">{gradeDistribution.D}%</td>
                <td className="py-4 px-6 text-center font-mono text-on-surface-variant">-1.0σ</td>
                <td className="py-4 px-6 text-center"><Badge variant="outline">Passing</Badge></td>
              </tr>
              <tr className="hover:bg-surface-variant/10">
                <td className="py-4 px-6 text-center font-bold text-error">F</td>
                <td className="py-4 px-6 text-center font-mono text-error">{gradeDistribution.F}%</td>
                <td className="py-4 px-6 text-center font-mono text-error">-1.8σ</td>
                <td className="py-4 px-6 text-center"><Badge variant="error">Critical</Badge></td>
              </tr>
            </tbody>
          </table>
        </Card>
      </section>

    </div>
  );
};
export default AnalyticsPanel;
