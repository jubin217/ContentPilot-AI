import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Copy, Check, CornerDownLeft, RefreshCw, ChevronRight, BarChart2, Eye, ShieldAlert, Award, FileText, Github, Mail, Hash } from 'lucide-react';

interface FloatingWidgetProps {
  activeElement: HTMLElement;
  onInsert: (text: string) => void;
  onClose: () => void;
}

type TabType = 'generate' | 'rewrite' | 'analyze';

export default function FloatingWidget({ activeElement, onInsert, onClose }: FloatingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  
  // Analytics and tone states
  const [detectedTone, setDetectedTone] = useState('');
  const [scores, setScores] = useState<{ hook: number; storytelling: number; engagement: number; feedback: string } | null>(null);
  const [copilotData, setCopilotData] = useState<{ linkedin_post: string; resume_update: string; github_project_idea: string; interview_questions: string[] } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Extract text from the active input element
  const getInputValue = () => {
    // Check if there is highlighted/selected text first
    const selection = window.getSelection()?.toString();
    if (selection && selection.trim().length > 0) {
      return selection.trim();
    }

    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      return activeElement.value;
    }
    return activeElement.innerText || '';
  };

  useEffect(() => {
    // Set initial text
    setInputText(getInputValue());
  }, [activeElement, isOpen]);

  // Handle outside clicks to close the widget
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Only close if we are not loading
        if (!loading) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [loading]);

  const callAPI = (endpoint: string, payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: "apiCall",
          payload: {
            endpoint,
            method: "POST",
            body: payload
          }
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (response && response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response?.error || "Unknown API error"));
          }
        }
      );
    });
  };

  const handleAction = async (type: string, param: string) => {
    const rawText = getInputValue();
    if (!rawText.trim()) {
      setError("Please type some text in the field first.");
      return;
    }

    setLoading(true);
    setError('');
    setOutputText('');
    setScores(null);
    setDetectedTone('');
    setCopilotData(null);

    try {
      if (type === 'generate') {
        const res = await callAPI('/api/generate', {
          text: rawText,
          format: param,
          style: 'Professional'
        });
        setOutputText(res.output_text);
      } else if (type === 'rewrite') {
        const res = await callAPI('/api/rewrite', {
          text: rawText,
          action: param
        });
        setOutputText(res.output_text);
      } else if (type === 'tone') {
        const res = await callAPI('/api/tone', { text: rawText });
        setDetectedTone(res.detected_tone);
        setOutputText(res.professional_reply);
      } else if (type === 'engagement') {
        const res = await callAPI('/api/predict-engagement', { text: rawText });
        setScores(res.scores);
        setOutputText(res.scores.feedback);
      } else if (type === 'copilot') {
        const res = await callAPI('/api/career-copilot', { achievement: rawText });
        setCopilotData(res);
        setOutputText(res.linkedin_post); // default preview is the LinkedIn post
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please check if the API server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = outputText || '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertText = () => {
    onInsert(outputText);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="font-sans text-slate-100 antialiased select-none">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-indigo-600 shadow-lg shadow-brand-500/20 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border border-brand-400/20"
          title="ContentPilot AI"
        >
          <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
        </button>
      )}

      {/* Main Extension Overlay UI */}
      {isOpen && (
        <div className="absolute right-0 bottom-11 w-80 rounded-2xl border border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden max-h-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">ContentPilot AI</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg p-1 transition cursor-pointer text-xs"
            >
              Close
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-[220px]">
            {loading ? (
              /* Loading State */
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
                <div className="relative flex items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500/20 border-t-brand-500"></div>
                  <Sparkles className="absolute h-4 w-4 text-brand-400 animate-pulse" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm font-medium text-slate-200">Writing copy...</span>
                  <span className="text-xs text-slate-500 mt-1">Calling nvidia Nemotron-3 (550B)</span>
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6 text-center">
                <ShieldAlert className="h-8 w-8 text-rose-500" />
                <span className="text-xs text-slate-300 px-4 leading-relaxed font-medium">{error}</span>
                <button
                  onClick={() => setError('')}
                  className="mt-2 text-xs font-semibold px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 transition cursor-pointer"
                >
                  Go Back
                </button>
              </div>
            ) : outputText || copilotData ? (
              /* Output Preview State */
              <div className="flex-grow flex flex-col gap-3">
                {/* Tone badge */}
                {detectedTone && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-900/30 text-indigo-300 text-xs font-medium self-start">
                    <Award className="h-3.5 w-3.5" />
                    Detected Tone: <span className="font-bold text-indigo-200">{detectedTone}</span>
                  </div>
                )}

                {/* Score indicators */}
                {scores && (
                  <div className="grid grid-cols-3 gap-2 py-1 bg-slate-900/40 border border-slate-900 rounded-xl p-2.5">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Hook</span>
                      <span className={`text-sm font-bold mt-1 ${scores.hook >= 7 ? 'text-emerald-400' : scores.hook >= 4 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {scores.hook}/10
                      </span>
                    </div>
                    <div className="flex flex-col items-center border-x border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Story</span>
                      <span className={`text-sm font-bold mt-1 ${scores.storytelling >= 7 ? 'text-emerald-400' : scores.storytelling >= 4 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {scores.storytelling}/10
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Engage</span>
                      <span className={`text-sm font-bold mt-1 ${scores.engagement >= 7 ? 'text-emerald-400' : scores.engagement >= 4 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {scores.engagement}/10
                      </span>
                    </div>
                  </div>
                )}

                {/* Career Copilot Selector */}
                {copilotData && (
                  <div className="flex bg-slate-900/50 p-1.5 rounded-lg border border-slate-900 gap-1.5 text-[11px] font-semibold">
                    <button
                      onClick={() => setOutputText(copilotData.linkedin_post)}
                      className={`flex-1 py-1 rounded text-center cursor-pointer transition ${outputText === copilotData.linkedin_post ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Post
                    </button>
                    <button
                      onClick={() => setOutputText(copilotData.resume_update)}
                      className={`flex-1 py-1 rounded text-center cursor-pointer transition ${outputText === copilotData.resume_update ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => setOutputText(copilotData.github_project_idea)}
                      className={`flex-1 py-1 rounded text-center cursor-pointer transition ${outputText === copilotData.github_project_idea ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      GitHub
                    </button>
                    <button
                      onClick={() => setOutputText(copilotData.interview_questions.join('\n\n'))}
                      className={`flex-1 py-1 rounded text-center cursor-pointer transition ${outputText === copilotData.interview_questions.join('\n\n') ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Q&A
                    </button>
                  </div>
                )}

                {/* Preview text */}
                <div className="relative flex-1 flex flex-col">
                  <textarea
                    value={outputText}
                    onChange={(e) => setOutputText(e.target.value)}
                    className="flex-1 w-full min-h-[140px] text-xs leading-relaxed bg-slate-900/70 border border-slate-800 rounded-xl p-3 outline-none focus:border-brand-500 text-slate-100 resize-none font-sans"
                  />
                  <button
                    onClick={handleCopy}
                    className="absolute right-2.5 top-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white p-1.5 rounded-lg border border-slate-700/50 cursor-pointer transition"
                    title="Copy to Clipboard"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Confirm Actions */}
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => {
                      setOutputText('');
                      setCopilotData(null);
                      setScores(null);
                      setDetectedTone('');
                    }}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleInsertText}
                    className="flex-[1.5] py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/10 flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    <CornerDownLeft className="h-3.5 w-3.5" />
                    Insert
                  </button>
                </div>
              </div>
            ) : (
              /* Menu Options State */
              <div className="flex-1 flex flex-col">
                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-900 mb-4 bg-slate-900/10 p-0.5 rounded-lg">
                  <button
                    onClick={() => setActiveTab('generate')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${activeTab === 'generate' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    Generate
                  </button>
                  <button
                    onClick={() => setActiveTab('rewrite')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${activeTab === 'rewrite' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    Rewrite
                  </button>
                  <button
                    onClick={() => setActiveTab('analyze')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${activeTab === 'analyze' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    Analyze
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="flex-grow flex flex-col justify-start">
                  {activeTab === 'generate' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAction('generate', 'LinkedIn Post')}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900 hover:border-slate-800 text-left text-xs font-medium cursor-pointer transition group"
                      >
                        <FileText className="h-4 w-4 text-sky-400 group-hover:scale-110 transition duration-150" />
                        LinkedIn Post
                      </button>
                      <button
                        onClick={() => handleAction('generate', 'Resume Bullet')}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900 hover:border-slate-800 text-left text-xs font-medium cursor-pointer transition group"
                      >
                        <Award className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition duration-150" />
                        Resume Bullet
                      </button>
                      <button
                        onClick={() => handleAction('generate', 'Cover Letter Paragraph')}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900 hover:border-slate-800 text-left text-xs font-medium cursor-pointer transition group"
                      >
                        <Mail className="h-4 w-4 text-violet-400 group-hover:scale-110 transition duration-150" />
                        Cover Letter
                      </button>
                      <button
                        onClick={() => handleAction('generate', 'GitHub README')}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900 hover:border-slate-800 text-left text-xs font-medium cursor-pointer transition group"
                      >
                        <Github className="h-4 w-4 text-slate-300 group-hover:scale-110 transition duration-150" />
                        GitHub README
                      </button>
                      <button
                        onClick={() => handleAction('generate', 'Professional Email')}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900 hover:border-slate-800 text-left text-xs font-medium cursor-pointer transition group"
                      >
                        <Mail className="h-4 w-4 text-amber-400 group-hover:scale-110 transition duration-150" />
                        Email Draft
                      </button>
                      <button
                        onClick={() => handleAction('generate', 'Twitter/X Thread')}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900 hover:border-slate-800 text-left text-xs font-medium cursor-pointer transition group"
                      >
                        <Hash className="h-4 w-4 text-brand-400 group-hover:scale-110 transition duration-150" />
                        Twitter Thread
                      </button>
                    </div>
                  )}

                  {activeTab === 'rewrite' && (
                    <div className="flex flex-col gap-2">
                      {['Shorten', 'Expand', 'Professionalize', 'Simplify', 'Improve Grammar', 'Add Storytelling'].map((action) => (
                        <button
                          key={action}
                          onClick={() => handleAction('rewrite', action)}
                          className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-900 bg-slate-900/10 hover:bg-slate-900 hover:border-slate-800 text-xs font-medium cursor-pointer transition group"
                        >
                          <span className="text-slate-200">{action}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition duration-150" />
                        </button>
                      ))}
                    </div>
                  )}

                  {activeTab === 'analyze' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAction('tone', '')}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900 hover:border-slate-800 text-left text-xs font-semibold cursor-pointer transition group"
                      >
                        <Eye className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition duration-150" />
                        <div className="flex flex-col">
                          <span>AI Tone Detector</span>
                          <span className="text-[10px] font-normal text-slate-500 mt-0.5">Analyzes writing tone and drafts reply</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAction('engagement', '')}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900 hover:border-slate-800 text-left text-xs font-semibold cursor-pointer transition group"
                      >
                        <BarChart2 className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition duration-150" />
                        <div className="flex flex-col">
                          <span>Engagement Predictor</span>
                          <span className="text-[10px] font-normal text-slate-500 mt-0.5">Grades Hook, Story, and Engagement</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAction('copilot', '')}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900 hover:border-slate-800 text-left text-xs font-semibold cursor-pointer transition group"
                      >
                        <Award className="h-4 w-4 text-brand-400 group-hover:scale-110 transition duration-150" />
                        <div className="flex flex-col">
                          <span>AI Career Copilot</span>
                          <span className="text-[10px] font-normal text-slate-500 mt-0.5">Suggests post, resume edit, & code project</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2 border-t border-slate-900 bg-slate-950 flex items-center justify-between text-[9px] text-slate-500">
            <span>Powered by Nemotron-3 (550B)</span>
            <span>ContentPilot AI</span>
          </div>
        </div>
      )}
    </div>
  );
}
