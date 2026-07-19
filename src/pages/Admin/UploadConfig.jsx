import React, { useState } from 'react';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Loader } from '../../components/Loader';
import { UploadCloud, FileJson, CheckCircle, AlertTriangle, ArrowRight, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

export const UploadConfig = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateJSONSchema = (json) => {
    if (!json.title || !json.duration || !Array.isArray(json.questions)) {
      throw new Error("Missing required schema parameters: 'title', 'duration', or 'questions' array.");
    }
    if (json.questions.length === 0) {
      throw new Error("The 'questions' list cannot be empty.");
    }
    return true;
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    const isJson = selectedFile.name.endsWith('.json');
    const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls');

    if (!isJson && !isExcel) {
      toast.error('Only JSON (.json) and Excel (.xlsx, .xls) configurations are supported.');
      return;
    }

    if (selectedFile.size > 2000000) {
      toast.error('File size exceeds the 2MB limit.');
      return;
    }

    setFile(selectedFile);
    setErrorMsg('');
    setParsedData(null);

    if (isJson) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          validateJSONSchema(json);
          setParsedData(json);
          toast.success('JSON specification parsed successfully.');
        } catch (err) {
          setErrorMsg(err.message || 'Malformed JSON file.');
        }
      };
      reader.readAsText(selectedFile);
    } else {
      // Excel spreadsheet
      setParsedData({
        title: selectedFile.name,
        isExcel: true,
        questions: { length: 'Multiple' }
      });
      toast.success('Excel configuration file selected.');
    }
  };

  const downloadJSONTemplate = async () => {
    const loadId = toast.loading('Downloading JSON template...');
    try {
      const blob = await testService.downloadJSONTemplate();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample_exam_template.json');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('JSON template downloaded!', { id: loadId });
    } catch (e) {
      toast.error('Failed to download template.', { id: loadId });
    }
  };

  const downloadExcelTemplate = async () => {
    const loadId = toast.loading('Downloading Excel template...');
    try {
      const blob = await testService.downloadExcelTemplate();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample_exam_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Excel template downloaded!', { id: loadId });
    } catch (e) {
      toast.error('Failed to download template.', { id: loadId });
    }
  };

  const handleImportSubmit = async () => {
    if (!file || !parsedData) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('config', file);

      await testService.uploadTestConfig(formData);
      toast.success('Exam configuration and questions bulk-imported successfully!');
      
      // Reset
      setFile(null);
      setParsedData(null);
      setErrorMsg('');
    } catch (e) {
      console.error(e);
      toast.error('Failed to upload and import configuration spec.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 text-on-background max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-background">Upload Exam Configuration</h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Import complete examination questions, schemes, and guidelines directly using a structured JSON or Excel spreadsheet.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload box */}
        <section className="lg:col-span-2">
          <Card 
            variant="solid" 
            className={`border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-all min-h-[340px] ${
              dragActive ? 'border-secondary bg-surface-container-high/50' : 'border-outline-variant/30'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleFileDrop}
          >
            <UploadCloud className="w-16 h-16 text-on-surface-variant/60 mb-4 animate-pulse-soft" />
            <h3 className="font-h4 text-base font-bold mb-1 text-on-surface">Drag and Drop configuration file</h3>
            <p className="text-xs text-on-surface-variant/80 max-w-xs mb-6">Supports JSON (.json) or Excel (.xlsx, .xls) files up to 2MB.</p>
            
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept=".json,.xlsx,.xls"
              onChange={handleFileInputChange}
            />
            <label htmlFor="file-upload">
              <span className="px-6 py-2.5 rounded-xl bg-surface-container hover:bg-surface-variant/30 text-on-surface border border-outline-variant/30 font-button text-xs cursor-pointer inline-block transition-colors">
                Choose Configuration File
              </span>
            </label>
          </Card>
        </section>

        {/* Info panel */}
        <aside className="lg:col-span-1 flex flex-col gap-4">
          <Card variant="solid" className="p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/80 mb-3 font-mono">Download Templates</h4>
              <p className="text-[11px] text-on-surface-variant/90 mb-4 leading-relaxed">
                Download pre-formatted sample files to see exactly what columns and schema fields to add.
              </p>
              
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={downloadJSONTemplate}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 bg-surface-container hover:bg-surface-variant/30 text-xs font-semibold text-on-surface transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-primary" />
                    Sample JSON Template
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={downloadExcelTemplate}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 bg-surface-container hover:bg-surface-variant/30 text-xs font-semibold text-on-surface transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    Sample Excel Template
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>

          <Card variant="solid" className="p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/80 mb-3 font-mono">JSON Spec Format</h4>
              <pre className="text-[9px] font-mono bg-surface-container-lowest p-3.5 rounded-xl text-on-surface-variant overflow-x-auto leading-relaxed border border-outline-variant/20 max-h-48">
{`{
  "title": "Sample Exam",
  "duration": 90,
  "difficulty": "Medium",
  "negativeMarking": 0.25,
  "questions": [
    {
      "question": "Question text...",
      "correctAnswer": "A",
      "category": "Math",
      "options": [
        "Option A text",
        "Option B text"
      ]
    }
  ]
}`}
              </pre>
            </div>
          </Card>
        </aside>
      </div>

      {/* Parse Preview Status */}
      {(file || errorMsg) && (
        <section>
          <Card variant="solid" className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-6 pb-3 border-b border-outline-variant/20">
              Configuration Parser Summary
            </h3>

            {errorMsg ? (
              <div className="flex gap-4 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs md:text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold">Schema Parsing Error</h4>
                  <p className="mt-1 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            ) : parsedData ? (
              <div className="space-y-6">
                <div className="flex gap-4 p-4 bg-secondary/10 border border-secondary/20 rounded-xl text-secondary text-xs md:text-sm">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Configuration valid</h4>
                    <p className="mt-1">Schema matches specifications cleanly. Ready to import.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-xs font-semibold text-on-surface-variant">
                  {parsedData.isExcel ? (
                    <>
                      <div>File Name: <span className="text-on-surface block mt-0.5">{file.name}</span></div>
                      <div>Type: <span className="text-on-surface block mt-0.5 text-emerald-500">Excel Spreadsheet</span></div>
                      <div>Size: <span className="text-on-surface block mt-0.5">{(file.size / 1024).toFixed(1)} KB</span></div>
                      <div>Format: <span className="text-on-surface block mt-0.5 text-secondary">Bilingual Ready</span></div>
                    </>
                  ) : (
                    <>
                      <div>Title: <span className="text-on-surface block mt-0.5">{parsedData.title}</span></div>
                      <div>Difficulty: <span className="text-on-surface block mt-0.5">{parsedData.difficulty || 'Medium'}</span></div>
                      <div>Total Questions: <span className="text-on-surface block mt-0.5">{parsedData.questions.length} MCQs</span></div>
                      <div>Duration: <span className="text-on-surface block mt-0.5">{parsedData.duration || 60} Minutes</span></div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="ghost" className="text-on-surface-variant hover:text-on-surface" onClick={() => { setFile(null); setParsedData(null); }}>Clear</Button>
                  <Button variant="solid" className="bg-secondary text-white hover:opacity-90 flex items-center gap-2" onClick={handleImportSubmit} isLoading={isUploading}>
                    Import Test <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-12 flex justify-center">
                <Loader />
              </div>
            )}
          </Card>
        </section>
      )}

    </div>
  );
};

export default UploadConfig;
