import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { Dropdown } from '../../components/Dropdown';
import { Pagination } from '../../components/Pagination';
import {
  ArrowLeft, Plus, Edit2, Trash2, HelpCircle, UploadCloud,
  Download, FileJson, FileSpreadsheet, X, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── JSON output sample ───────────────────────────────────────────────────────
const JSON_PREVIEW = `[
  {
    "question":      "What is the state animal of Haryana?",
    "options":       ["Cow", "Blackbuck", "Nilgai", "Tiger"],
    "correctAnswer": "B",
    "category":      "General Knowledge",
    "difficulty":    "Easy",
    "marks":         1,
    "negativeMarks": 0.25,
    "explanation":   "The state animal of Haryana is the Blackbuck."
  },
  { "...more questions" }
]`;

const EXCEL_COLUMNS = [
  { col: '#',            desc: 'Serial number' },
  { col: 'Question',     desc: 'Full question text' },
  { col: 'Option A',     desc: 'First option' },
  { col: 'Option B',     desc: 'Second option' },
  { col: 'Option C',     desc: 'Third option (if any)' },
  { col: 'Option D',     desc: 'Fourth option (if any)' },
  { col: 'Option E',     desc: 'Fifth option (if any)' },
  { col: 'CorrectAnswer',desc: 'Letter: A / B / C / D / E' },
  { col: 'Category',     desc: 'Topic / category label' },
  { col: 'Difficulty',   desc: 'Easy / Medium / Hard' },
  { col: 'Marks',        desc: 'Positive marks awarded' },
  { col: 'NegativeMarks',desc: 'Marks deducted on wrong answer' },
  { col: 'Explanation',  desc: 'Solution rationale (optional)' },
];

// ─── Export Modal ─────────────────────────────────────────────────────────────
const ExportModal = ({ testId, testTitle, onClose }) => {
  const [format, setFormat]   = useState('json');
  const [type, setType]       = useState('data');   // 'data' | 'template'
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    const label = `${format === 'excel' ? 'Excel' : 'JSON'} (${type === 'template' ? 'Format only' : 'With data'})`;
    const toastId = toast.loading(`Exporting as ${label}…`);
    try {
      await testService.exportQuestions(testId, format, type);
      toast.success('Questions exported & downloaded!', { id: toastId });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Export failed.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const downloadLabel = `Download ${format === 'excel' ? 'Excel' : 'JSON'} · ${type === 'template' ? 'Format only' : 'With data'}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface-container rounded-2xl border border-outline-variant/30 shadow-2xl shadow-black/50 flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-on-surface">Export Questions</h2>
              <p className="text-[10px] text-on-surface-variant font-semibold truncate max-w-xs">{testTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* ── Step 1 — Format selector */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2.5">1. Choose file format</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'json',  Icon: FileJson,        label: 'JSON',         sub: 'Array of question objects (.json)' },
                { key: 'excel', Icon: FileSpreadsheet,  label: 'Excel (.xlsx)', sub: 'Spreadsheet — one question per row' },
              ].map(({ key, Icon, label, sub }) => (
                <button
                  key={key}
                  onClick={() => setFormat(key)}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border text-left cursor-pointer
                    transition-all duration-150
                    ${format === key
                      ? 'border-secondary bg-secondary/8 shadow-sm shadow-secondary/20'
                      : 'border-outline-variant/30 bg-surface-container-low hover:border-secondary/40 hover:bg-secondary/4'
                    }
                  `}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${format === key ? 'bg-secondary/15 text-secondary' : 'bg-surface-container text-on-surface-variant'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${format === key ? 'text-secondary' : 'text-on-surface'}`}>{label}</p>
                    <p className="text-[10px] text-on-surface-variant font-semibold leading-tight">{sub}</p>
                  </div>
                  {format === key && <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* ── Step 2 — Export type */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2.5">2. Select export type</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  key: 'data',
                  emoji: '📦',
                  label: 'With data',
                  sub: 'Export all actual questions from this exam',
                  badge: null,
                },
                {
                  key: 'template',
                  emoji: '📋',
                  label: 'Format only',
                  sub: 'Empty template with correct column/key structure',
                  badge: 'For import prep',
                },
              ].map(({ key, emoji, label, sub, badge }) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={`
                    flex items-start gap-3 p-4 rounded-xl border text-left cursor-pointer
                    transition-all duration-150
                    ${type === key
                      ? 'border-primary bg-primary/8 shadow-sm shadow-primary/20'
                      : 'border-outline-variant/30 bg-surface-container-low hover:border-primary/40 hover:bg-primary/4'
                    }
                  `}
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-bold ${type === key ? 'text-primary' : 'text-on-surface'}`}>{label}</p>
                      {badge && (
                        <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wide">{badge}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-semibold leading-tight mt-0.5">{sub}</p>
                  </div>
                  {type === key && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* ── Step 3 — Output format preview */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2.5">3. Output format preview</p>

            {format === 'json' ? (
              <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-container border-b border-outline-variant/15">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant ml-1">
                    {type === 'template' ? 'template.json' : 'questions_export.json'}
                  </span>
                  <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    type === 'template' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                  }`}>
                    {type === 'template' ? '1 example row' : 'Re-importable'}
                  </span>
                </div>
                <pre className="text-[11px] text-on-surface-variant/90 font-mono p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">{JSON_PREVIEW}</pre>
              </div>
            ) : (
              <div className="rounded-xl border border-outline-variant/20 overflow-hidden">
                <div className="bg-surface-container px-4 py-2.5 border-b border-outline-variant/15 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-on-surface-variant">
                    {type === 'template' ? 'template.xlsx' : 'questions_export.xlsx'} — Column structure
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    type === 'template' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                  }`}>
                    {type === 'template' ? '1 example row' : `${EXCEL_COLUMNS.length} columns`}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider border-b border-outline-variant/15">
                        <th className="text-left px-3 py-2">Column</th>
                        <th className="text-left px-3 py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {EXCEL_COLUMNS.map(({ col, desc }) => (
                        <tr key={col} className="hover:bg-surface-container/40">
                          <td className="px-3 py-2 font-mono font-bold text-on-surface">{col}</td>
                          <td className="px-3 py-2 text-on-surface-variant">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/20 flex items-center justify-between gap-3 bg-surface-container/50">
          <p className="text-[10px] text-on-surface-variant font-semibold">
            {type === 'template'
              ? 'Download an empty template you can fill in and re-import.'
              : 'All questions in this exam will be included in the export.'
            }
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={onClose} className="h-9 px-5">Cancel</Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleExport}
              disabled={loading}
              className="h-9 px-5 flex items-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                : <Download className="w-4 h-4" />
              }
              {downloadLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


export const ManageQuestions = () => {
  const { id: testId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination]   = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit]     = useState(20);


  // Modal & Form State
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion]   = useState(null);

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

  const fetchTestAndQuestions = useCallback(async (page = currentPage, limit = pageLimit) => {
    setIsLoading(true);
    try {
      const [testData, questionsRes] = await Promise.all([
        testService.getTestDetails(testId),
        testService.getQuestions(testId, { page, limit })
      ]);
      setTest(testData);
      setQuestions(questionsRes.data);
      setPagination(questionsRes.pagination);
    } catch (e) {
      toast.error('Failed to load test questions.');
    } finally {
      setIsLoading(false);
    }
  }, [testId, currentPage, pageLimit]);

  useEffect(() => {
    fetchTestAndQuestions(currentPage, pageLimit);
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
      fetchTestAndQuestions(currentPage, pageLimit);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question.');
    }
  };

  const handleDelete = async (qId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await testService.deleteQuestion(qId);
        toast.success('Question deleted successfully.');
        fetchTestAndQuestions(currentPage, pageLimit);
      } catch (e) {
        toast.error('Failed to delete question.');
      }
    }
  };


  const handleJSONUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isJson = file.name.endsWith('.json');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    
    if (!isJson && !isExcel) {
      toast.error('Please select a valid JSON or Excel file.');
      return;
    }

    if (file.size > 2000000) {
      toast.error('File size exceeds the 2MB limit.');
      return;
    }

    const toastId = toast.loading('Uploading questions...');
    try {
      await testService.importQuestionsJSON(testId, file);
      toast.success('Questions imported successfully!', { id: toastId });
      fetchTestAndQuestions(1, pageLimit); // reload from page 1 after bulk import
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import questions.', { id: toastId });
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
            Managing {pagination?.total ?? questions.length} questions in catalog • Difficulty: {test.difficulty} • Marks: {test.totalMarks} M
          </p>

        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleJSONUpload}
            accept=".json,.xlsx,.xls"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-10 px-4"
          >
            <UploadCloud className="w-4 h-4" /> Import JSON / Excel
          </Button>

          <Button
            onClick={() => setIsExportModalOpen(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-10 px-4"
          >
            <Download className="w-4 h-4" /> Export
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

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={(p) => { setCurrentPage(p); fetchTestAndQuestions(p, pageLimit); }}
        onLimitChange={(l) => { setPageLimit(l); setCurrentPage(1); fetchTestAndQuestions(1, l); }}
        pageSizeOptions={[10, 20, 50, 100]}
      />

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal
          testId={testId}
          testTitle={test.title}
          onClose={() => setIsExportModalOpen(false)}
        />
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
