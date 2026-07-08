import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/Loader';
import { Input } from '../../components/Input';
import { Dropdown } from '../../components/Dropdown';
import { Search, Filter, BookOpen, Clock, Award, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AvailableTests = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const data = await testService.getAvailableTests();
        setTests(data);
        setFilteredTests(data);
      } catch (error) {
        toast.error('Failed to retrieve test catalog.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTests();
  }, []);

  useEffect(() => {
    let result = tests;
    
    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.categories && Array.isArray(t.categories) && t.categories.some(cat => cat.toLowerCase().includes(q)))
      );
    }

    // Subject selection filter
    if (selectedSubject !== 'all') {
      result = result.filter(t => t.subject === selectedSubject);
    }

    setFilteredTests(result);
  }, [searchQuery, selectedSubject, tests]);

  // Unique list of subjects
  const subjects = ['all', ...new Set(tests.map(t => t.subject).filter(Boolean))];

  if (isLoading) {
    return <Loader size="lg" className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-8">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h1 className="font-h3 text-2xl md:text-3xl font-bold text-on-surface">Available Examinations</h1>
          <p className="font-body text-xs md:text-sm text-on-surface-variant">
            Choose an exam below to view guidelines and commence testing.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests..."
              className="w-full h-11 pl-10 pr-4 bg-surface-container dark:bg-surface-container-low border border-outline-variant/30 rounded-xl font-body text-xs focus:ring-2 focus:ring-primary/20 text-on-surface"
            />
          </div>

          {/* Subject Filter Dropdown */}
          <div className="w-full sm:w-48">
            <Dropdown
              value={selectedSubject}
              onChange={setSelectedSubject}
              options={subjects.map(subj => ({
                value: subj,
                label: subj === 'all' ? 'All Subjects' : subj
              }))}
            />
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredTests.length === 0 ? (
        <Card variant="glass" className="p-12 text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-outline mb-4" />
          <h3 className="font-h4 text-lg font-bold text-on-surface">No Tests Match Filters</h3>
          <p className="font-body text-sm text-on-surface-variant mt-2">
            Try adjusting your search criteria or checking another subject.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card 
              key={test.id} 
              variant="glass" 
              className="overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col p-0 border-outline-variant/20"
            >
              {/* Color Bar indicator */}
              <div className={`h-3 w-full ${
                test.color === 'secondary' || test.difficulty === 'Medium' ? 'bg-secondary' : test.color === 'tertiary' || test.difficulty === 'Easy' ? 'bg-tertiary' : 'bg-primary'
              }`} />
              
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge variant={test.difficulty === 'Hard' ? 'error' : test.difficulty === 'Medium' ? 'tertiary' : 'secondary'}>
                      {test.difficulty}
                    </Badge>
                    <span className="text-[10px] text-primary dark:text-primary-fixed font-bold uppercase tracking-wider">
                      {test.subject}
                    </span>
                  </div>
                  <h3 className="font-h4 text-lg font-bold text-on-surface leading-tight group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">
                    {test.title}
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant line-clamp-3 mt-3 leading-relaxed">
                    {test.description}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant pt-2 border-t border-outline-variant/20">
                  <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-outline" /> {test.questionsCount} Qs</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-outline" /> {test.duration} Min</span>
                  <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-outline" /> {test.totalMarks} Marks</span>
                </div>

                <Button 
                  onClick={() => navigate(`/tests/${test.id}`)}
                  variant={test.color === 'secondary' || test.difficulty === 'Medium' ? 'solid' : test.color === 'tertiary' || test.difficulty === 'Easy' ? 'solid' : 'gradient'}
                  className={
                    (test.color === 'secondary' || test.difficulty === 'Medium') ? 'bg-secondary hover:opacity-90' : (test.color === 'tertiary' || test.difficulty === 'Easy') ? 'bg-tertiary hover:opacity-90' : ''
                  }
                  fullWidth
                >
                  Configure & Start
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
export default AvailableTests;
