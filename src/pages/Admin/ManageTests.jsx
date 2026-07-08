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
import { Trash2, Edit2, Plus, FileText, AlertCircle, School } from 'lucide-react';
import toast from 'react-hot-toast';

const TestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subject: z.string().min(2, 'Subject is required'),
  category: z.string().min(2, 'Category description is required'),
  questionsCount: z.preprocess((val) => Number(val), z.number().min(1, 'At least 1 question is required')),
  duration: z.preprocess((val) => Number(val), z.number().min(5, 'Minimum duration is 5 minutes')),
  totalMarks: z.preprocess((val) => Number(val), z.number().min(10, 'Minimum total marks is 10')),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  color: z.enum(['primary', 'secondary', 'tertiary']),
  batch: z.string().min(1, 'Target batch assignment is required'),
  webcamProctoring: z.boolean().optional().default(false)
});

export const ManageTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, control } = useForm({
    resolver: zodResolver(TestSchema),
    defaultValues: {
      title: '', subject: '', category: '', questionsCount: 50, duration: 90, totalMarks: 100, difficulty: 'Medium', color: 'primary', batch: '', webcamProctoring: false
    }
  });

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
      title: '', subject: '', category: '', questionsCount: 50, duration: 90, totalMarks: 100, difficulty: 'Medium', color: 'primary', batch: '', webcamProctoring: false
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
      difficulty: test.difficulty,
      color: test.color || 'primary',
      batch: test.batch?._id || test.batch || '',
      webcamProctoring: !!test.webcamProctoring
    });
    setIsModalOpen(true);
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

            <div className="mt-4 pt-4 border-t border-outline-variant/20">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" fullWidth onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" fullWidth>{editingTest ? 'Save Changes' : 'Create Examination'}</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
export default ManageTests;
