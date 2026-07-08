import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { Dropdown } from '../../components/Dropdown';
import { ArrowLeft, Plus, Edit2, Trash2, HelpCircle, FileText, Settings, BadgeAlert, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageQuestions = () => {
  const { id: testId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''], // A, B, C, D default
    correctAnswer: 'A',
    category: 'General',
    difficulty: 'Medium',
    marks: 1,
    negativeMarks: 0.25,
    explanation: ''
  });

  const fetchTestAndQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const [testData, questionsData] = await Promise.all([
        testService.getTestDetails(testId),
        testService.getQuestions(testId)
      ]);
      setTest(testData);
      setQuestions(questionsData);
    } catch (e) {
      toast.error('Failed to load test questions.');
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchTestAndQuestions();
  }, [fetchTestAndQuestions]);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 'A',
      category: 'General',
      difficulty: 'Medium',
      marks: 1,
      negativeMarks: 0.25,
      explanation: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      category: q.category || 'General',
      difficulty: q.difficulty || 'Medium',
      marks: q.marks || 1,
      negativeMarks: q.negativeMarks !== undefined ? q.negativeMarks : 0.25,
      explanation: q.explanation || ''
    });
    setIsModalOpen(true);
  };

  const handleOptionChange = (idx, val) => {
    const next = [...formData.options];
    next[idx] = val;
    setFormData(prev => ({ ...prev, options: next }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) { toast.error('Question text is required.'); return; }
    if (formData.options.some(opt => !opt.trim())) { toast.error('All option choices must be filled.'); return; }

    const payload = {
      ...formData,
      testId
    };

    try {
      if (editingQuestion) {
        await testService.updateQuestion(editingQuestion._id, payload);
        toast.success('Question updated successfully.');
      } else {
        await testService.createQuestion(payload);
        toast.success('New question added successfully.');
      }
      setIsModalOpen(false);
      fetchTestAndQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question.');
    }
  };

  const handleDelete = async (qId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await testService.deleteQuestion(qId);
        toast.success('Question deleted successfully.');
        fetchTestAndQuestions();
      } catch (e) {
        toast.error('Failed to delete question.');
      }
    }
  };

  const handleJSONUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast.error('Please select a valid JSON file.');
      return;
    }

    const toastId = toast.loading('Uploading questions...');
    try {
      await testService.importQuestionsJSON(testId, file);
      toast.success('Questions imported successfully!', { id: toastId });
      fetchTestAndQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import questions JSON.', { id: toastId });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) return <Loader size="lg" className="min-h-[60vh]" />;
  if (!test) return <div className="text-center py-10 text-on-surface-variant">Test not found.</div>;

  return (
    <div className="space-y-6 text-on-background">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/admin/tests')}
            className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Examinations
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold text-on-surface">{test.title}</h1>
          <p className="text-xs text-on-surface-variant">
            Managing {questions.length} questions in catalog • Difficulty: {test.difficulty} • Marks: {test.totalMarks} M
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleJSONUpload}
            accept=".json,application/json"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-10 px-4"
          >
            <UploadCloud className="w-4 h-4" /> Import JSON
          </Button>

          <Button onClick={openCreateModal} variant="gradient" size="sm" className="flex items-center gap-2 h-10 px-4">
            <Plus className="w-5 h-5" /> Add Question
          </Button>
        </div>
      </div>

      {/* Questions Listing */}
      {questions.length === 0 ? (
        <Card variant="solid" className="flex flex-col items-center justify-center p-12 text-center border border-outline-variant/10">
          <HelpCircle className="w-12 h-12 text-on-surface-variant/40 mb-3" />
          <h3 className="font-bold text-on-surface text-base">No Questions Yet</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mt-1 mb-5">
            This examination is currently empty. Click one of the options below to add questions.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4" /> Import JSON
            </Button>
            <Button onClick={openCreateModal} variant="gradient" size="sm" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Question
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q._id} variant="solid" className="p-5 border border-outline-variant/10 flex flex-col gap-4 relative overflow-hidden group">
              {/* Question metadata header */}
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs bg-surface-container px-2 py-0.5 rounded-lg text-primary">Q{idx + 1}</span>
                  <Badge variant={q.difficulty === 'Hard' ? 'error' : q.difficulty === 'Medium' ? 'tertiary' : 'secondary'}>
                    {q.difficulty}
                  </Badge>
                  <span className="text-[10px] text-on-surface-variant font-semibold">
                    Category: {q.category} • Marks: {q.marks} M • Neg: -{q.negativeMarks} M
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEditModal(q)} className="p-1.5 rounded-lg hover:bg-primary/[0.08] text-on-surface-variant hover:text-primary transition-colors cursor-pointer" title="Edit Question">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(q._id)} className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors cursor-pointer" title="Delete Question">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question stem */}
              <div className="text-sm font-semibold text-on-surface leading-relaxed">
                {q.question}
              </div>

              {/* Options list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, oIdx) => {
                  const label = String.fromCharCode(65 + oIdx); // A, B, C, D
                  const isCorrect = q.correctAnswer === label;
                  return (
                    <div
                      key={oIdx}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isCorrect
                          ? 'bg-secondary/8 border-secondary text-on-surface'
                          : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                        isCorrect ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {label}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation block */}
              {q.explanation && (
                <div className="bg-surface-container-highest/20 border-l-4 border-primary/50 rounded-r-xl p-3 text-xs mt-1">
                  <div className="font-bold text-primary mb-1">Explanation:</div>
                  <p className="text-on-surface-variant leading-relaxed font-normal">{q.explanation}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Question Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card variant="solid" className="w-full max-w-2xl p-6 border border-outline-variant/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3 mb-5">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-secondary" /> 
                {editingQuestion ? 'Modify Question Details' : 'Create New Question'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              {/* Question stem */}
              <div className="space-y-1">
                <label className="text-on-surface-variant">Question Text *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question description..."
                  className="w-full p-3 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface font-normal focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Option fields */}
              <div className="space-y-2">
                <label className="text-on-surface-variant">Answer Choices *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="relative flex items-center">
                      <span className="absolute left-3 font-bold text-primary">{String.fromCharCode(65 + idx)}</span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={e => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="w-full h-10 pl-8 pr-3 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface font-normal focus:outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct option + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-on-surface-variant">Correct Answer *</label>
                  <Dropdown
                    options={[
                      { value: 'A', label: 'Option A' },
                      { value: 'B', label: 'Option B' },
                      { value: 'C', label: 'Option C' },
                      { value: 'D', label: 'Option D' }
                    ]}
                    value={formData.correctAnswer}
                    onChange={val => setFormData({ ...formData, correctAnswer: val })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-on-surface-variant">Question Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="General, Math, Logic..."
                    className="w-full h-11 px-3 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface font-normal focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Difficulty + Marks + Neg marks */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-on-surface-variant">Difficulty Level *</label>
                  <Dropdown
                    options={[
                      { value: 'Easy', label: 'Easy' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'Hard', label: 'Hard' }
                    ]}
                    value={formData.difficulty}
                    onChange={val => setFormData({ ...formData, difficulty: val })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-on-surface-variant">Positive Marks *</label>
                  <input
                    type="number"
                    required
                    min={0.5}
                    step={0.5}
                    value={formData.marks}
                    onChange={e => setFormData({ ...formData, marks: parseFloat(e.target.value) })}
                    className="w-full h-11 px-3 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface font-normal focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-on-surface-variant">Negative Marks *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={0.25}
                    value={formData.negativeMarks}
                    onChange={e => setFormData({ ...formData, negativeMarks: parseFloat(e.target.value) })}
                    className="w-full h-11 px-3 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface font-normal focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-1">
                <label className="text-on-surface-variant">Solution Explanation</label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Provide an explanation/rationalization of the solution choice..."
                  className="w-full p-3 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface font-normal focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-on-surface-variant">Cancel</Button>
                <Button type="submit" variant="gradient">
                  {editingQuestion ? 'Save Changes' : 'Create Question'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;
