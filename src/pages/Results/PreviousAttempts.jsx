import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { Calendar, History, ArrowUpRight, Award, Trophy, Timer } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const PreviousAttempts = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const data = await testService.getPreviousAttempts();
        setAttempts(data);
      } catch (error) {
        toast.error('Failed to load attempt history.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  if (isLoading) {
    return <Loader size="lg" className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-h3 text-2xl md:text-3xl font-bold text-on-surface">Previous Attempts</h1>
        <p className="font-body text-xs md:text-sm text-on-surface-variant">
          Review your historically completed examinations and detail scorecards.
        </p>
      </div>

      {attempts.length === 0 ? (
        <EmptyState 
          title="No Attempts Logged Yet"
          description="You haven't completed any examinations yet. Head over to Available Tests to get started!"
          actionText="Explore Tests"
          onActionClick={() => navigate('/tests')}
          icon={History}
        />
      ) : (
        <Card variant="glass" className="p-0 overflow-hidden border-outline-variant/20">
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container dark:bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-bold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Examination Title</th>
                  <th className="py-4 px-6 text-center">Score</th>
                  <th className="py-4 px-6 text-center">Accuracy</th>
                  <th className="py-4 px-6 text-center">Completed Date</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-surface-container-low/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-on-surface">{att.testTitle}</td>
                    <td className="py-4 px-6 text-center font-mono font-bold text-primary dark:text-primary-fixed">
                      {att.score} / {att.totalMarks}
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-bold text-secondary">
                      {att.accuracy}%
                    </td>
                    <td className="py-4 px-6 text-center text-on-surface-variant font-medium">
                      <span className="flex items-center justify-center gap-1.5">
                        <Calendar className="w-4 h-4 text-outline" />
                        {format(new Date(att.date), 'MMM dd, yyyy • HH:mm')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant="secondary">Completed</Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button 
                        onClick={() => navigate(`/results/summary?attemptId=${att.id}`)}
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:underline font-bold"
                      >
                        Details <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards List View */}
          <div className="md:hidden divide-y divide-outline-variant/20">
            {attempts.map((att) => (
              <div key={att.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-on-surface text-base">{att.testTitle}</h4>
                  <Badge variant="secondary">Completed</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-on-surface-variant">
                  <div className="flex items-center gap-1.5"><Award className="w-4 h-4 text-outline" /> Score: {att.score}/{att.totalMarks}</div>
                  <div className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-outline" /> Accuracy: {att.accuracy}%</div>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-outline" /> 
                    {format(new Date(att.date), 'MMM dd, yyyy • HH:mm')}
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/results/summary?attemptId=${att.id}`)}
                  variant="outline"
                  size="sm"
                  fullWidth
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>

        </Card>
      )}
    </div>
  );
};
export default PreviousAttempts;
