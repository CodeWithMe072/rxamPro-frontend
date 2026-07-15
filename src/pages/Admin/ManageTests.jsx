import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Dropdown } from '../../components/Dropdown';
import { DatePicker } from '../../components/DatePicker';
import { Trash2, Edit2, Plus, FileText, AlertCircle, School, Eye, Calendar, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const TestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subject: z.string().min(2, 'Subject is required'),
  category: z.string().min(2, 'Category description is required'),
  questionsCount: z.preprocess((val) => Number(val), z.number().min(1, 'At least 1 question is required')),
  duration: z.preprocess((val) => Number(val), z.number().min(5, 'Minimum duration is 5 minutes')),
  totalMarks: z.preprocess((val) => Number(val), z.number().min(10, 'Minimum total marks is 10')),
  negativeMarking: z.preprocess((val) => Number(val), z.number().min(0, 'Negative marking must be at least 0')),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  color: z.enum(['primary', 'secondary', 'tertiary']),
  batch: z.string().min(1, 'Target batch assignment is required'),
  webcamProctoring: z.boolean().optional().default(false),
  useLatePenalty: z.boolean().optional().default(true),
  useAttemptPenalty: z.boolean().optional().default(true),
  maxAttempts: z.preprocess((val) => val === '' ? 0 : Number(val), z.number().min(0).optional().default(0)),
  startDate: z.string().optional().nullable().or(z.date().optional()),
  endDate: z.string().optional().nullable().or(z.date().optional())
});

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const ManageTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  const [isAttemptsModalOpen, setIsAttemptsModalOpen] = useState(false);
  const [selectedTestForAttempts, setSelectedTestForAttempts] = useState(null);
  const [filteredAttempts, setFilteredAttempts] = useState([]);
  const [isAttemptsLoading, setIsAttemptsLoading] = useState(false);

  const [showSnapshotsModal, setShowSnapshotsModal] = useState(false);
  const [selectedAttemptForSnapshots, setSelectedAttemptForSnapshots] = useState(null);

  // Advanced conducting sessions (schedules) management states
  const [isSchedulesModalOpen, setIsSchedulesModalOpen] = useState(false);
  const [selectedTestForSchedules, setSelectedTestForSchedules] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [isSchedulesLoading, setIsSchedulesLoading] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isConfigureScheduleModalOpen, setIsConfigureScheduleModalOpen] = useState(false);
  const [attemptsSchedules, setAttemptsSchedules] = useState([]);
  const [selectedScheduleForAttemptsFilter, setSelectedScheduleForAttemptsFilter] = useState('all');

  // States for the schedule configure sub-form
  const [scheduleBatch, setScheduleBatch] = useState('');
  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [scheduleEndDate, setScheduleEndDate] = useState('');
  const [scheduleMaxAttempts, setScheduleMaxAttempts] = useState(0);
  const [scheduleUseLatePenalty, setScheduleUseLatePenalty] = useState(true);
  const [scheduleUseAttemptPenalty, setScheduleUseAttemptPenalty] = useState(true);
  const [scheduleIsPublished, setScheduleIsPublished] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset, setValue, control, watch } = useForm({
    resolver: zodResolver(TestSchema),
    defaultValues: {
      title: '', subject: '', category: '', questionsCount: 50, duration: 90, totalMarks: 100, negativeMarking: 0.25, difficulty: 'Medium', color: 'primary', batch: '', webcamProctoring: false,
      useLatePenalty: true, useAttemptPenalty: true, maxAttempts: 0, startDate: '', endDate: ''
    }
  });

  const watchStartDate = watch('startDate');

  const fetchTestsAndBatches = async () => {
    setIsLoading(true);
    try {
      const [testsData, batchesData] = await Promise.all([
        testService.getAvailableTests(),
        testService.getBatches()
      ]);
      setTests(testsData);
      setBatches(batchesData);
    } catch (e) {
      toast.error('Failed to reload tests list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestsAndBatches();
  }, []);

  const openCreateModal = () => {
    setEditingTest(null);
    reset({
      title: '', subject: '', category: '', questionsCount: 50, duration: 90, totalMarks: 100, negativeMarking: 0.25, difficulty: 'Medium', color: 'primary', batch: '', webcamProctoring: false,
      useLatePenalty: true, useAttemptPenalty: true, maxAttempts: 0, startDate: '', endDate: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (test) => {
    setEditingTest(test);
    reset({
      title: test.title,
      subject: test.subject,
      category: test.category,
      questionsCount: test.questionsCount,
      duration: test.duration,
      totalMarks: test.totalMarks,
      negativeMarking: test.negativeMarking !== undefined && test.negativeMarking !== null ? test.negativeMarking : 0.25,
      difficulty: test.difficulty,
      color: test.color || 'primary',
      batch: test.batch?._id || test.batch || '',
      webcamProctoring: !!test.webcamProctoring,
      useLatePenalty: test.useLatePenalty !== false,
      useAttemptPenalty: test.useAttemptPenalty !== false,
      maxAttempts: test.maxAttempts || 0,
      startDate: test.startDate ? new Date(test.startDate).toISOString().slice(0, 16) : '',
      endDate: test.endDate ? new Date(test.endDate).toISOString().slice(0, 16) : ''
    });
    setIsModalOpen(true);
  };

  const openAttemptsModal = async (test) => {
    setSelectedTestForAttempts(test);
    setIsAttemptsModalOpen(true);
    setIsAttemptsLoading(true);
    try {
      const [data, schedulesData] = await Promise.all([
        testService.getAttempts(),
        testService.getTestSchedules(test.id)
      ]);
      const filtered = data.filter(att => {
        const attemptTestId = att.testId?._id || att.testId?.id || att.testId;
        return attemptTestId === test.id;
      });
      setFilteredAttempts(filtered);
      setAttemptsSchedules(schedulesData || []);
      setSelectedScheduleForAttemptsFilter('all');
    } catch (e) {
      toast.error('Failed to load student attempts.');
    } finally {
      setIsAttemptsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingTest) {
        await testService.updateTest(editingTest.id, data);
        toast.success('Test updated successfully.');
      } else {
        await testService.createTest(data);
        toast.success('New test created successfully.');
      }
      setIsModalOpen(false);
      fetchTestsAndBatches();
    } catch (e) {
      toast.error('Failed to save test details.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await testService.deleteTest(id);
        toast.success('Test deleted successfully.');
        fetchTestsAndBatches();
      } catch (e) {
        toast.error('Failed to delete test.');
      }
    }
  };

  const openSchedulesModal = async (test) => {
    setSelectedTestForSchedules(test);
    setIsSchedulesModalOpen(true);
    fetchSchedules(test.id);
  };

  const fetchSchedules = async (testId) => {
    setIsSchedulesLoading(true);
    try {
      const data = await testService.getTestSchedules(testId);
      setSchedules(data);
    } catch (e) {
      toast.error('Failed to load conducting schedules.');
    } finally {
      setIsSchedulesLoading(false);
    }
  };

  const openCreateSchedule = () => {
    setEditingSchedule(null);
    setScheduleBatch(batches[0]?._id || '');
    setScheduleStartDate('');
    setScheduleEndDate('');
    setScheduleMaxAttempts(0);
    setScheduleUseLatePenalty(true);
    setScheduleUseAttemptPenalty(true);
    setScheduleIsPublished(true);
    setIsConfigureScheduleModalOpen(true);
  };

  const openEditSchedule = (sched) => {
    setEditingSchedule(sched);
    setScheduleBatch(sched.batch?._id || sched.batch || '');
    setScheduleStartDate(sched.startDate ? new Date(sched.startDate).toISOString().slice(0, 16) : '');
    setScheduleEndDate(sched.endDate ? new Date(sched.endDate).toISOString().slice(0, 16) : '');
    setScheduleMaxAttempts(sched.maxAttempts || 0);
    setScheduleUseLatePenalty(sched.useLatePenalty !== false);
    setScheduleUseAttemptPenalty(sched.useAttemptPenalty !== false);
    setScheduleIsPublished(sched.isPublished !== false);
    setIsConfigureScheduleModalOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleBatch) {
      toast.error('Please assign a target batch.');
      return;
    }
    
    const payload = {
      batch: scheduleBatch,
      startDate: scheduleStartDate || null,
      endDate: scheduleEndDate || null,
      maxAttempts: Number(scheduleMaxAttempts) || 0,
      useLatePenalty: scheduleUseLatePenalty,
      useAttemptPenalty: scheduleUseAttemptPenalty,
      isPublished: scheduleIsPublished
    };

    try {
      if (editingSchedule) {
        await testService.updateTestSchedule(editingSchedule._id, payload);
        toast.success('Conduct session updated successfully.');
      } else {
        await testService.createTestSchedule(selectedTestForSchedules.id, payload);
        toast.success('New conduct session scheduled successfully.');
      }
      setIsConfigureScheduleModalOpen(false);
      fetchSchedules(selectedTestForSchedules.id);
    } catch (e) {
      toast.error('Failed to save conducting session details.');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this conducting session? This will permanently delete all student scores and attempts made in this session!')) {
      try {
        await testService.deleteTestSchedule(scheduleId);
        toast.success('Conducting session deleted successfully.');
        fetchSchedules(selectedTestForSchedules.id);
      } catch (e) {
        toast.error('Failed to delete conducting session.');
      }
    }
  };

  const handleExportTest = async (testId, testTitle) => {
    const loadId = toast.loading(`Generating score spreadsheet for ${testTitle}...`);
    try {
      const blob = await testService.exportTest(testId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exam_results_${testTitle.replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Excel standings generated successfully!', { id: loadId });
    } catch (e) {
      toast.error('Failed to export test results.', { id: loadId });
    }
  };

  if (isLoading) {
    return <Loader size="lg" className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-8 text-on-background">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Manage Examinations</h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Create, update, and delete examinations currently hosted in the testing catalog.
          </p>
        </div>
        <Button onClick={openCreateModal} variant="gradient" size="sm" className="flex items-center gap-2 h-10">
          <Plus className="w-5 h-5" /> Add Exam
        </Button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <Card key={test.id} variant="solid" className="flex flex-col justify-between p-6">
            <div onClick={() => navigate(`/admin/tests/${test.id}/questions`)} className="cursor-pointer group flex-grow">
              <div className="flex justify-between items-start gap-2 mb-2">
                <Badge variant={test.difficulty === 'Hard' ? 'error' : test.difficulty === 'Medium' ? 'tertiary' : 'secondary'}>
                  {test.difficulty}
                </Badge>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                  {test.subject} • <School className="w-3 h-3" /> {test.batch?.name || 'Unassigned'}
                </span>
              </div>
              <h3 className="font-h4 text-base md:text-lg font-bold text-on-surface truncate group-hover:text-primary transition-colors">{test.title}</h3>
              <p className="text-xs text-on-surface-variant mt-1 truncate">{test.category}</p>
              
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-outline-variant/20 text-[10px] font-semibold text-on-surface-variant text-center">
                <div>
                  <div className="text-on-surface-variant/60 mb-0.5">Questions</div>
                  <div className="text-xs text-on-surface">{test.questionsCount} Qs</div>
                </div>
                <div className="border-x border-outline-variant/20">
                  <div className="text-on-surface-variant/60 mb-0.5">Duration</div>
                  <div className="text-xs text-on-surface">{test.duration} Min</div>
                </div>
                <div>
                  <div className="text-on-surface-variant/60 mb-0.5">Total Marks</div>
                  <div className="text-xs text-on-surface">{test.totalMarks} M</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
              <Button 
                onClick={() => openSchedulesModal(test)}
                variant="outline" 
                size="sm" 
                fullWidth
                className="flex items-center justify-center gap-1.5 h-10 hover:bg-secondary/5 text-secondary border-secondary/20 cursor-pointer text-xs font-semibold"
              >
                <Calendar className="w-4 h-4" /> Conduct Sessions (Schedules)
              </Button>
              <Button 
                onClick={() => openAttemptsModal(test)}
                variant="gradient" 
                size="sm" 
                fullWidth
                className="flex items-center justify-center gap-1.5 h-10 cursor-pointer text-xs font-semibold"
              >
                <Eye className="w-4 h-4" /> View Student Attempts
              </Button>
              <Button 
                onClick={() => handleExportTest(test.id, test.title)}
                variant="outline" 
                size="sm" 
                fullWidth
                className="flex items-center justify-center gap-1.5 h-10 hover:bg-primary/5 text-primary border-primary/20 cursor-pointer text-xs font-semibold"
              >
                <FileText className="w-4 h-4" /> Export Results to Excel
              </Button>
            </div>

            <div className="flex gap-4 pt-6 mt-4 border-t border-outline-variant/20">
              <Button onClick={() => openEditModal(test)} variant="outline" size="sm" className="w-full">
                <Edit2 className="w-4 h-4 mr-1.5" /> Edit
              </Button>
              <Button onClick={() => handleDelete(test.id)} variant="danger" size="sm" className="w-full">
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete
              </Button>
            </div>
          </Card>
        ))}
      </section>

      {/* Creation / Editing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTest ? 'Modify Examination Details' : 'Create New Examination'}
        size="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-on-surface">
          <Input 
            label="Exam Title"
            type="text"
            error={errors.title?.message}
            {...register('title')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Subject"
              type="text"
              error={errors.subject?.message}
              {...register('subject')}
            />
            <Input 
              label="Category / Tagline"
              type="text"
              error={errors.category?.message}
              {...register('category')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Total Questions"
              type="number"
              error={errors.questionsCount?.message}
              {...register('questionsCount')}
            />
            <Input 
              label="Duration (Minutes)"
              type="number"
              error={errors.duration?.message}
              {...register('duration')}
            />
            <Input 
              label="Total Marks"
              type="number"
              error={errors.totalMarks?.message}
              {...register('totalMarks')}
            />
            <Input 
              label="Negative Marking"
              type="number"
              step="0.01"
              error={errors.negativeMarking?.message}
              {...register('negativeMarking')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant">Difficulty Level</label>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    options={[
                      { value: 'Easy', label: 'Easy' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'Hard', label: 'Hard' }
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Difficulty"
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant">Theme Style Color</label>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    options={[
                      { value: 'primary', label: 'Primary (Blue)' },
                      { value: 'secondary', label: 'Secondary (Green)' },
                      { value: 'tertiary', label: 'Tertiary (Orange)' }
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Theme Color"
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant">Assign Batch</label>
              <Controller
                name="batch"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    options={batches.map(b => ({ value: b._id, label: b.name }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Student Batch"
                  />
                )}
              />
              {errors.batch?.message && <span className="text-[10px] text-error font-medium">{errors.batch.message}</span>}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface">
            <input 
              type="checkbox" 
              id="webcamProctoring"
              className="w-4.5 h-4.5 text-primary bg-surface-container border-outline-variant rounded focus:ring-primary accent-primary cursor-pointer"
              {...register('webcamProctoring')}
            />
            <label htmlFor="webcamProctoring" className="cursor-pointer select-none">
              Enable Webcam Snapshot Proctoring (Captures periodic & infraction photo logs)
            </label>
          </div>

          <div className="text-xs font-bold text-secondary uppercase tracking-wider pt-2 border-t border-outline-variant/20">
            Conducting & Schedule Session Options
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-xs font-semibold text-on-surface text-left">
              <label className="text-on-surface-variant">Session Opening Date & Time</label>
              <Controller
                control={control}
                name="startDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    value={value}
                    onChange={onChange}
                    placeholder="Select Opening Time"
                    showTime={true}
                    minDate={getTodayString()}
                  />
                )}
              />
              {errors.startDate && (
                <span className="text-[10px] text-error mt-0.5">{errors.startDate.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5 text-xs font-semibold text-on-surface text-left">
              <label className="text-on-surface-variant">Session Closing Date & Time</label>
              <Controller
                control={control}
                name="endDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    value={value}
                    onChange={onChange}
                    placeholder="Select Closing Time"
                    showTime={true}
                    minDate={watchStartDate || getTodayString()}
                  />
                )}
              />
              {errors.endDate && (
                <span className="text-[10px] text-error mt-0.5">{errors.endDate.message}</span>
              )}
            </div>
          </div>

          <Input 
            label="Maximum Allowed Attempts (0 for unlimited)"
            type="number"
            error={errors.maxAttempts?.message}
            {...register('maxAttempts')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface">
              <input 
                type="checkbox" 
                id="useLatePenalty"
                className="w-4.5 h-4.5 text-primary bg-surface-container border-outline-variant rounded focus:ring-primary accent-primary cursor-pointer"
                {...register('useLatePenalty')}
              />
              <label htmlFor="useLatePenalty" className="cursor-pointer select-none">
                Enable Late Submission Penalty
              </label>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface">
              <input 
                type="checkbox" 
                id="useAttemptPenalty"
                className="w-4.5 h-4.5 text-primary bg-surface-container border-outline-variant rounded focus:ring-primary accent-primary cursor-pointer"
                {...register('useAttemptPenalty')}
              />
              <label htmlFor="useAttemptPenalty" className="cursor-pointer select-none">
                Enable Repeat Attempt Penalty (Decay)
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" fullWidth onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" fullWidth>{editingTest ? 'Save Changes' : 'Create Examination'}</Button>
          </div>
        </form>
      </Modal>

      {/* Student Attempts List Modal */}
      <Modal
        isOpen={isAttemptsModalOpen}
        onClose={() => setIsAttemptsModalOpen(false)}
        title={`Student Attempts: ${selectedTestForAttempts?.title || ''}`}
        size="4xl"
      >
        {isAttemptsLoading ? (
          <Loader size="md" className="min-h-[200px]" />
        ) : filteredAttempts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-on-surface">
            <AlertCircle className="w-12 h-12 text-on-surface-variant/40 mb-3 animate-pulse" />
            <p className="text-sm font-semibold">No student attempts recorded for this examination yet.</p>
          </div>
        ) : (
          <div>
            {/* Session Dropdown Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
              <div>
                <div className="text-xs font-bold text-on-surface">Filter by Conducting Session</div>
                <div className="text-[10px] text-on-surface-variant">Display attempts only for a specific batch or window.</div>
              </div>
              <div className="w-full sm:w-72 text-left">
                <Dropdown
                  options={[
                    { value: 'all', label: 'All Conducting Sessions' },
                    ...attemptsSchedules.map(sched => {
                      const hasStart = !!sched.startDate;
                      const dateStr = hasStart ? new Date(sched.startDate).toLocaleDateString() : '';
                      const label = `${sched.batch?.name || 'Unassigned Batch'}${hasStart ? ` (${dateStr})` : ' (Always Open)'}`;
                      return { value: sched._id, label };
                    })
                  ]}
                  value={selectedScheduleForAttemptsFilter}
                  onChange={setSelectedScheduleForAttemptsFilter}
                  placeholder="Select Conducting Session"
                  size="sm"
                />
              </div>
            </div>

            {filteredAttempts.filter(att => {
              if (selectedScheduleForAttemptsFilter === 'all') return true;
              const attSchedId = att.testScheduleId?._id || att.testScheduleId?.id || att.testScheduleId;
              return attSchedId === selectedScheduleForAttemptsFilter;
            }).length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-on-surface">
                <AlertCircle className="w-10 h-10 text-on-surface-variant/40 mb-2" />
                <p className="text-xs font-semibold">No student attempts recorded for this conducting session.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm text-on-surface">
                  <thead>
                    <tr className="bg-surface-container-high border-b border-outline-variant/20 text-on-surface-variant font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-2 text-center">Conduct Session</th>
                      <th className="py-3 px-2 text-center">Attempt</th>
                      <th className="py-3 px-2 text-center">Score</th>
                      <th className="py-3 px-2 text-center">Accuracy</th>
                      <th className="py-3 px-2 text-center">Webcam Snaps</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-medium text-on-surface">
                    {filteredAttempts
                      .filter(att => {
                        if (selectedScheduleForAttemptsFilter === 'all') return true;
                        const attSchedId = att.testScheduleId?._id || att.testScheduleId?.id || att.testScheduleId;
                        return attSchedId === selectedScheduleForAttemptsFilter;
                      })
                      .map((att) => {
                        const snapCount = att.snapshots?.length || 0;
                        const schedObj = att.testScheduleId;
                        const batchName = schedObj?.batch?.name || 'Always Open';
                        const dateStr = schedObj?.startDate ? new Date(schedObj.startDate).toLocaleDateString() : '';
                        const sessionLabel = dateStr ? `${batchName} (${dateStr})` : batchName;

                        return (
                          <tr key={att._id} className="hover:bg-surface-variant/5">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-on-surface">{att.userId?.name || 'Student'}</div>
                              <div className="text-[10px] text-on-surface-variant">{att.userId?.email || ''}</div>
                            </td>
                            <td className="py-3.5 px-2 text-center text-on-surface font-semibold">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-container-high border border-outline-variant/20 rounded-lg text-[10px] font-bold text-on-surface-variant">
                                {sessionLabel}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-center text-on-surface font-semibold">
                              #{att.attemptNumber || 1}
                            </td>
                      <td className="py-3.5 px-2 text-center font-bold text-primary">
                        {att.score} / {selectedTestForAttempts?.totalMarks || 100}
                      </td>
                      <td className="py-3.5 px-2 text-center font-bold text-secondary">
                        {att.accuracy}%
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        {snapCount > 0 ? (
                          <Badge variant="tertiary" className="font-bold font-mono">{snapCount} captured</Badge>
                        ) : (
                          <span className="text-[10px] text-on-surface-variant/40">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {snapCount > 0 && (
                            <Button 
                              onClick={() => {
                                setSelectedAttemptForSnapshots(att);
                                setShowSnapshotsModal(true);
                              }}
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-3 text-[10px] cursor-pointer"
                            >
                              Review Snaps
                            </Button>
                          )}
                          <Button 
                            onClick={() => navigate(`/results/summary?attemptId=${att._id}`)}
                            variant="gradient" 
                            size="sm" 
                            className="h-8 px-3 text-[10px] cursor-pointer"
                          >
                            View Result
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
          </div>
        )}
      </Modal>

      {/* Proctoring Webcam Snapshots Modal */}
      {showSnapshotsModal && selectedAttemptForSnapshots && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-6" style={{ zIndex: 9999 }}>
          <Card variant="glass" className="w-full max-w-2xl p-6 border-white/20 max-h-[85vh] flex flex-col justify-between">
            <div className="overflow-y-auto pr-1">
              <h3 className="font-h3 text-xl font-bold text-on-surface mb-1">
                Proctoring Webcam Snapshots
              </h3>
              <p className="text-xs text-on-surface-variant mb-6 font-medium">
                Active monitoring capture log for exam attempt: <strong>{selectedAttemptForSnapshots.testId?.title}</strong>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedAttemptForSnapshots.snapshots.map((snap, idx) => (
                  <div key={idx} className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/20">
                    <img 
                      src={snap.image} 
                      alt={`Proctoring Snapshot ${idx + 1}`} 
                      className="w-full h-40 object-cover" 
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
            </div>

            <div className="flex justify-end pt-4 border-t border-outline-variant/20 mt-6">
              <Button onClick={() => setShowSnapshotsModal(false)} variant="gradient" className="px-8 animate-button">
                Done
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Conducting Schedules Modal */}
      <Modal
        isOpen={isSchedulesModalOpen}
        onClose={() => setIsSchedulesModalOpen(false)}
        title={`Conducting Sessions — ${selectedTestForSchedules?.title || 'Exam'}`}
        size="4xl"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-on-surface-variant font-medium">
              Create, update, and manage multiple scheduling windows and attempt constraints for this assessment.
            </p>
            <Button onClick={openCreateSchedule} variant="gradient" size="sm" className="flex items-center gap-1.5 h-9">
              <Plus className="w-4 h-4" /> Add Session
            </Button>
          </div>

          {isSchedulesLoading ? (
            <Loader size="md" className="py-12" />
          ) : schedules.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant bg-surface-container/30 border border-dashed border-outline-variant/30 rounded-2xl font-bold text-sm">
              No conducting sessions have been scheduled yet. Click 'Add Session' to configure one.
            </div>
          ) : (
            <div className="overflow-x-auto border border-outline-variant/20 rounded-2xl bg-surface-container/10">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container-low text-on-surface-variant font-bold">
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4">Active Schedule Window</th>
                    <th className="py-3 px-4 text-center">Max Attempts</th>
                    <th className="py-3 px-4 text-center">Late Penalty</th>
                    <th className="py-3 px-4 text-center">Attempt Decay</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                  {schedules.map((sched) => {
                    const hasStart = !!sched.startDate;
                    const hasEnd = !!sched.endDate;
                    
                    return (
                      <tr key={sched._id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-4 font-bold flex items-center gap-1.5">
                          <School className="w-4 h-4 text-secondary" />
                          {sched.batch?.name || 'Unassigned'}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {hasStart || hasEnd ? (
                            <span className="flex flex-col gap-0.5">
                              {hasStart && <span>Opens: <strong className="text-on-surface-variant font-mono">{new Date(sched.startDate).toLocaleString()}</strong></span>}
                              {hasEnd && <span>Closes: <strong className="text-on-surface-variant font-mono">{new Date(sched.endDate).toLocaleString()}</strong></span>}
                            </span>
                          ) : (
                            <span className="text-secondary font-semibold">Always Open (No Window)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {sched.maxAttempts > 0 ? (
                            <Badge variant="tertiary">{sched.maxAttempts} Attempts</Badge>
                          ) : (
                            <span className="text-on-surface-variant/50">Unlimited</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {sched.useLatePenalty !== false ? (
                            <Badge variant="error">Enabled</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {sched.useAttemptPenalty !== false ? (
                            <Badge variant="error">Enabled</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {sched.isPublished !== false ? (
                            <Badge variant="secondary">Published</Badge>
                          ) : (
                            <Badge variant="neutral">Draft</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              onClick={() => openEditSchedule(sched)}
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2.5 text-[10px] cursor-pointer text-primary border-primary/20 hover:bg-primary/5"
                            >
                              Edit
                            </Button>
                            <Button 
                              onClick={() => handleDeleteSchedule(sched._id)}
                              variant="danger" 
                              size="sm" 
                              className="h-8 px-2.5 text-[10px] cursor-pointer"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* Configure Schedule Sub-Modal */}
      <Modal
        isOpen={isConfigureScheduleModalOpen}
        onClose={() => setIsConfigureScheduleModalOpen(false)}
        title={editingSchedule ? 'Edit Conducting Session' : 'Schedule Conducting Session'}
        size="lg"
      >
        <div className="space-y-6 text-on-surface">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface-variant">Assign Batch</label>
            <Dropdown
              options={batches.map(b => ({ value: b._id, label: b.name }))}
              value={scheduleBatch}
              onChange={setScheduleBatch}
              placeholder="Select Target Batch"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">Opening Date & Time</label>
              <DatePicker
                value={scheduleStartDate}
                onChange={setScheduleStartDate}
                placeholder="Select Opening Time"
                showTime={true}
                minDate={getTodayString()}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">Closing Date & Time</label>
              <DatePicker
                value={scheduleEndDate}
                onChange={setScheduleEndDate}
                placeholder="Select Closing Time"
                showTime={true}
                minDate={scheduleStartDate || getTodayString()}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">Maximum Allowed Attempts (0 for unlimited)</label>
            <input 
              type="number" 
              min="0"
              className="h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container text-xs text-on-surface focus:outline-none focus:border-primary"
              value={scheduleMaxAttempts}
              onChange={(e) => setScheduleMaxAttempts(e.target.value)}
            />
          </div>

          <div className="space-y-3.5 pt-4 border-t border-outline-variant/20">
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface">
              <input 
                type="checkbox" 
                id="scheduleUseLatePenalty"
                className="w-4.5 h-4.5 text-primary bg-surface-container border-outline-variant rounded focus:ring-primary accent-primary cursor-pointer"
                checked={scheduleUseLatePenalty}
                onChange={(e) => setScheduleUseLatePenalty(e.target.checked)}
              />
              <label htmlFor="scheduleUseLatePenalty" className="cursor-pointer select-none">
                Enable Late Submission Penalty
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface">
              <input 
                type="checkbox" 
                id="scheduleUseAttemptPenalty"
                className="w-4.5 h-4.5 text-primary bg-surface-container border-outline-variant rounded focus:ring-primary accent-primary cursor-pointer"
                checked={scheduleUseAttemptPenalty}
                onChange={(e) => setScheduleUseAttemptPenalty(e.target.checked)}
              />
              <label htmlFor="scheduleUseAttemptPenalty" className="cursor-pointer select-none">
                Enable Repeat Attempt Penalty (Decay)
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface">
              <input 
                type="checkbox" 
                id="scheduleIsPublished"
                className="w-4.5 h-4.5 text-primary bg-surface-container border-outline-variant rounded focus:ring-primary accent-primary cursor-pointer"
                checked={scheduleIsPublished}
                onChange={(e) => setScheduleIsPublished(e.target.checked)}
              />
              <label htmlFor="scheduleIsPublished" className="cursor-pointer select-none">
                Publish session immediately to students
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" fullWidth onClick={() => setIsConfigureScheduleModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSchedule} variant="gradient" fullWidth>Save Schedule</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
export default ManageTests;
