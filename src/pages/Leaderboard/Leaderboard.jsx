import React, { useEffect, useState } from 'react';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/Loader';
import { Dropdown } from '../../components/Dropdown';
import { Trophy, Award, Timer, Target, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

export const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFiltersAndLeaderboard = async () => {
      try {
        setIsLoading(true);
        // Load available tests for dropdown filter
        const availableTests = await testService.getAvailableTests();
        setTests(availableTests);

        // Load default global leaderboard
        const data = await testService.getLeaderboard('all');
        setLeaders(data);
      } catch (error) {
        toast.error('Failed to load leaderboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    loadFiltersAndLeaderboard();
  }, []);

  const handleTestChange = async (testId) => {
    setSelectedTest(testId);
    try {
      setIsLoading(true);
      const data = await testService.getLeaderboard(testId);
      setLeaders(data);
    } catch (error) {
      toast.error('Failed to load leaderboard for selected category.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader size="lg" className="min-h-[60vh]" />;
  }

  // Split top 3 for gamified display
  const topThree = leaders.filter(l => l.rank <= 3).sort((a, b) => a.rank - b.rank);
  const remaining = leaders.filter(l => l.rank > 3);

  const getCrownColor = (rank) => {
    if (rank === 1) return 'text-amber-400'; // Gold
    if (rank === 2) return 'text-slate-300'; // Silver
    return 'text-amber-700'; // Bronze
  };

  return (
    <div className="space-y-8">
      {/* Header & Filter Dropdown Selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-h3 text-2xl md:text-3xl font-bold text-on-surface">
            {selectedTest === 'all' ? 'Global Leaderboard' : 'Subject Leaderboard'}
          </h1>
          <p className="font-body text-xs md:text-sm text-on-surface-variant mt-1">
            {selectedTest === 'all' 
              ? "Benchmark your preparation against top aspirants nationwide. Rankings update live."
              : "See ranking performance for this specific exam subject."}
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="w-full sm:w-72">
          <Dropdown
            value={selectedTest}
            onChange={handleTestChange}
            options={[
              { value: 'all', label: 'Global Ranking (All Subjects)' },
              ...tests.map(t => ({ value: t.id, label: t.title }))
            ]}
          />
        </div>
      </div>

      {leaders.length === 0 ? (
        <Card variant="glass" className="p-12 text-center flex flex-col items-center border-white/10">
          <Trophy className="w-12 h-12 text-outline mb-4 animate-pulse" />
          <h3 className="font-h4 text-lg font-bold text-on-surface">No Leaders Yet</h3>
          <p className="font-body text-sm text-on-surface-variant mt-2 max-w-sm">
            Be the first to complete this exam and claim rank #1! Get started now by taking the test.
          </p>
        </Card>
      ) : (
        <>
          {/* Gamified Podium for Top 3 */}
          {topThree.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 max-w-3xl mx-auto">
              {topThree.map((podium) => (
                <Card 
                  key={podium.rank}
                  variant="glass"
                  className={`text-center flex flex-col items-center border relative p-6 transition-all duration-300 ${
                    podium.rank === 1 
                      ? 'order-1 md:order-2 border-amber-400/50 bg-amber-400/5 md:-translate-y-6 md:scale-105 shadow-xl shadow-amber-400/5' 
                      : podium.rank === 2 
                        ? 'order-2 md:order-1 border-slate-300/40 bg-slate-300/5' 
                        : 'order-3 border-amber-700/40 bg-amber-700/5'
                  }`}
                >
                  {/* Position Crown */}
                  <div className="absolute -top-7">
                    <Crown className={`w-12 h-12 ${getCrownColor(podium.rank)} drop-shadow`} />
                  </div>
                  
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center font-bold border-2 border-outline-variant/30 text-on-surface mb-4 mt-2 overflow-hidden">
                    <span className="text-xl">{(podium.name || 'A').charAt(0)}</span>
                  </div>

                  <h3 className="font-h4 text-base font-bold text-on-surface">{podium.name}</h3>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">Rank #{podium.rank}</p>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-outline-variant/20 w-full text-xs font-semibold text-on-surface-variant">
                    <div>
                      <Award className="w-4 h-4 text-primary mx-auto mb-1" />
                      <span>{podium.score} Pts</span>
                    </div>
                    <div>
                      <Target className="w-4 h-4 text-secondary mx-auto mb-1" />
                      <span>{podium.accuracy}% Acc</span>
                    </div>
                  </div>
                </Card>
              ))}
            </section>
          )}

          {/* Leaderboard Table */}
          {remaining.length > 0 && (
            <section>
              <Card variant="glass" className="p-0 overflow-hidden border-outline-variant/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container dark:bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-bold text-xs uppercase tracking-wider">
                        <th className="py-4 px-6 text-center w-20">Rank</th>
                        <th className="py-4 px-6">Candidate Name</th>
                        <th className="py-4 px-6 text-center">Score</th>
                        <th className="py-4 px-6 text-center">Accuracy</th>
                        <th className="py-4 px-6 text-center">Time Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-sm">
                      {remaining.map((row) => (
                        <tr 
                          key={row.rank} 
                          className={`transition-colors ${
                            row.isCurrentUser 
                              ? 'bg-primary/5 hover:bg-primary/10 border-y-2 border-primary font-bold' 
                              : 'hover:bg-surface-container-low/40 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-4 px-6 text-center font-mono font-bold text-on-surface">
                            {row.rank}
                          </td>
                          <td className="py-4 px-6 text-on-surface font-semibold flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface-container-high dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                              {(row.name || 'A').charAt(0)}
                            </div>
                            <span>{row.name}</span>
                          </td>
                          <td className="py-4 px-6 text-center font-mono font-bold text-primary dark:text-primary-fixed">
                            {row.score}
                          </td>
                          <td className="py-4 px-6 text-center font-mono font-bold text-secondary">
                            {row.accuracy}%
                          </td>
                          <td className="py-4 px-6 text-center text-on-surface-variant font-medium">
                            <span className="flex items-center justify-center gap-1.5">
                              <Timer className="w-4 h-4 text-outline" />
                              {row.timeSpent}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          )}

          {/* Fallback for table if all are in podium */}
          {remaining.length === 0 && leaders.length > 0 && (
            <section>
              <Card variant="glass" className="p-0 overflow-hidden border-outline-variant/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container dark:bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant font-bold text-xs uppercase tracking-wider">
                        <th className="py-4 px-6 text-center w-20">Rank</th>
                        <th className="py-4 px-6">Candidate Name</th>
                        <th className="py-4 px-6 text-center">Score</th>
                        <th className="py-4 px-6 text-center">Accuracy</th>
                        <th className="py-4 px-6 text-center">Time Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-sm">
                      {leaders.map((row) => (
                        <tr 
                          key={row.rank} 
                          className={`transition-colors ${
                            row.isCurrentUser 
                              ? 'bg-primary/5 hover:bg-primary/10 border-y-2 border-primary font-bold' 
                              : 'hover:bg-surface-container-low/40 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-4 px-6 text-center font-mono font-bold text-on-surface">
                            {row.rank}
                          </td>
                          <td className="py-4 px-6 text-on-surface font-semibold flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface-container-high dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                              {(row.name || 'A').charAt(0)}
                            </div>
                            <span>{row.name}</span>
                          </td>
                          <td className="py-4 px-6 text-center font-mono font-bold text-primary dark:text-primary-fixed">
                            {row.score}
                          </td>
                          <td className="py-4 px-6 text-center font-mono font-bold text-secondary">
                            {row.accuracy}%
                          </td>
                          <td className="py-4 px-6 text-center text-on-surface-variant font-medium">
                            <span className="flex items-center justify-center gap-1.5">
                              <Timer className="w-4 h-4 text-outline" />
                              {row.timeSpent}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          )}
        </>
      )}

    </div>
  );
};
export default Leaderboard;
