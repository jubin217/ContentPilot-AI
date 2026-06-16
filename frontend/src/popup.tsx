import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Sparkles, BookOpen, PenTool, BarChart3, History, Plus, Trash2, Copy, Check, ShieldAlert, Award, FileText, Github, BrainCircuit } from 'lucide-react';
import './index.css';

type TabType = 'dashboard' | 'journal' | 'style' | 'grader';

interface JournalEntry {
  id: number;
  text: string;
  category: string;
  created_at: string;
}

interface WritingStyle {
  id: number;
  name: string;
  sample_texts: string;
  analyzed_profile: string;
}

interface HistoryItem {
  id: number;
  original_text: string;
  format: string;
  style_or_action: string;
  output_text: string;
  created_at: string;
}

const BACKEND_URL = "http://127.0.0.1:8000";

function Popup() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // States for database items
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [styles, setStyles] = useState<WritingStyle[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Loading & error flags
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | string | null>(null);
  const [error, setError] = useState('');

  // Journal creation states
  const [newJournalText, setNewJournalText] = useState('');
  const [newJournalCategory, setNewJournalCategory] = useState('Project');
  const [selectedJournalIds, setSelectedJournalIds] = useState<number[]>([]);
  const [digestType, setDigestType] = useState('LinkedIn Post');
  const [digestOutput, setDigestOutput] = useState('');

  // Style trainer states
  const [styleName, setStyleName] = useState('My Signature Style');
  const [sampleText, setSampleText] = useState('');

  // Post Grader / Engagement Predictor states
  const [gradeInputText, setGradeInputText] = useState('');
  const [gradeOutput, setGradeOutput] = useState<{ hook: number; storytelling: number; engagement: number; feedback: string } | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchJournal();
    fetchStyles();
    fetchHistory();
  }, []);

  const handleCopy = (text: string, id: number | string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const fetchJournal = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/journal`);
      if (res.ok) {
        const data = await res.json();
        setJournal(data);
      }
    } catch (err) {
      console.error("Failed to fetch journal:", err);
    }
  };

  const fetchStyles = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/style`);
      if (res.ok) {
        const data = await res.json();
        setStyles(data);
      }
    } catch (err) {
      console.error("Failed to fetch styles:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const addJournalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournalText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newJournalText, category: newJournalCategory })
      });
      if (res.ok) {
        setNewJournalText('');
        fetchJournal();
      } else {
        const errText = await res.text();
        setError(errText);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteJournalEntry = async (id: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/journal/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setJournal(journal.filter(e => e.id !== id));
        setSelectedJournalIds(selectedJournalIds.filter(x => x !== id));
      }
    } catch (err) {
      console.error("Failed to delete journal entry:", err);
    }
  };

  const toggleSelectJournal = (id: number) => {
    if (selectedJournalIds.includes(id)) {
      setSelectedJournalIds(selectedJournalIds.filter(x => x !== id));
    } else {
      setSelectedJournalIds([...selectedJournalIds, id]);
    }
  };

  const generateDigest = async () => {
    if (selectedJournalIds.length === 0) return;
    setLoading(true);
    setDigestOutput('');
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/journal/generate-digest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_ids: selectedJournalIds, digest_type: digestType })
      });
      if (res.ok) {
        const data = await res.json();
        setDigestOutput(data.output_text);
      } else {
        const errText = await res.text();
        setError(errText);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const trainStyleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/style`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: styleName, sample_texts: sampleText })
      });
      if (res.ok) {
        fetchStyles();
        alert("Writing style trained successfully!");
      } else {
        const errText = await res.text();
        setError(errText);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const gradeCopy = async () => {
    if (!gradeInputText.trim()) return;
    setLoading(true);
    setGradeOutput(null);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/predict-engagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: gradeInputText })
      });
      if (res.ok) {
        const data = await res.json();
        setGradeOutput(data.scores);
      } else {
        const errText = await res.text();
        setError(errText);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[380px] h-[580px] flex flex-col bg-slate-950 border border-slate-900 overflow-hidden font-sans">
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/40 border-b border-slate-900 glass">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 shadow-md shadow-brand-500/10">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">ContentPilot AI</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-950/30 border border-emerald-900/30 rounded-full text-[10px] text-emerald-400 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Ready
        </div>
      </div>

      {/* Main Tab Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
        
        {/* Error Callout */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-300 text-xs flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-4 flex-1">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Journal Entries</span>
                <span className="text-xl font-bold mt-1 text-slate-100">{journal.length}</span>
              </div>
              <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Generations</span>
                <span className="text-xl font-bold mt-1 text-slate-100">{history.length}</span>
              </div>
            </div>

            {/* Quick Navigation Card */}
            <div className="p-4 bg-gradient-to-br from-brand-900/20 to-indigo-950/10 border border-brand-900/30 rounded-2xl flex flex-col gap-2">
              <span className="text-xs font-bold text-brand-300">Universal Assistant Enabled</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ContentPilot is monitoring text inputs. Whenever you click on an input field on any website and write something, click the floating ✨ icon to rewrite or expand it.
              </p>
            </div>

            {/* Recent History List */}
            <div className="flex flex-col gap-2 flex-grow">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Activity</span>
              {history.length === 0 ? (
                <div className="flex-1 border border-dashed border-slate-900 rounded-2xl flex flex-col items-center justify-center py-8 text-center px-4">
                  <History className="h-6 w-6 text-slate-700 mb-2" />
                  <span className="text-xs text-slate-500 font-medium">No recent generations</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                  {history.slice(0, 4).map((h) => (
                    <div key={h.id} className="p-2.5 bg-slate-900/20 border border-slate-900 rounded-xl flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-brand-400">{h.format}</span>
                        <span className="text-slate-500 font-medium">{h.style_or_action}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate leading-relaxed">{h.output_text}</p>
                      <button
                        onClick={() => handleCopy(h.output_text, h.id)}
                        className="text-[10px] font-semibold text-slate-500 hover:text-white flex items-center gap-1 mt-0.5 cursor-pointer self-start transition"
                      >
                        {copied === h.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy Output
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="flex flex-col gap-4 flex-1">
            {/* Add Entry Form */}
            <form onSubmit={addJournalEntry} className="flex gap-2">
              <input
                type="text"
                placeholder="Log a new achievement (e.g. Passed AWS test)"
                value={newJournalText}
                onChange={(e) => setNewJournalText(e.target.value)}
                className="flex-1 text-xs bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-brand-500 text-slate-100"
              />
              <select
                value={newJournalCategory}
                onChange={(e) => setNewJournalCategory(e.target.value)}
                className="text-xs bg-slate-900/50 border border-slate-800 rounded-xl px-2.5 py-2 outline-none text-slate-100 cursor-pointer"
              >
                {['Project', 'Course', 'Internship', 'Exam', 'General'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="bg-brand-600 hover:bg-brand-500 p-2.5 rounded-xl cursor-pointer text-white flex items-center justify-center transition disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            {/* Entry List */}
            <div className="flex-1 flex flex-col gap-3 min-h-[160px] max-h-[200px] overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Achievements ({journal.length})</span>
              {journal.length === 0 ? (
                <div className="flex-1 border border-dashed border-slate-900 rounded-2xl flex flex-col items-center justify-center py-6 text-center">
                  <Award className="h-6 w-6 text-slate-700 mb-2" />
                  <span className="text-xs text-slate-500 font-medium">No achievements logged yet</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {journal.map((j) => (
                    <div key={j.id} className="flex items-center justify-between p-2.5 bg-slate-900/20 border border-slate-900 rounded-xl gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedJournalIds.includes(j.id)}
                          onChange={() => toggleSelectJournal(j.id)}
                          className="mt-1 h-3.5 w-3.5 rounded border-slate-800 text-brand-600 focus:ring-brand-500 bg-slate-900 cursor-pointer"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-brand-400">{j.category}</span>
                          <span className="text-[11px] text-slate-200 leading-normal truncate">{j.text}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteJournalEntry(j.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/20 transition cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Synthesizer Trigger */}
            {selectedJournalIds.length > 0 && (
              <div className="p-3.5 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300">Generate Digest ({selectedJournalIds.length} selected)</span>
                  <select
                    value={digestType}
                    onChange={(e) => setDigestType(e.target.value)}
                    className="text-xs bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 outline-none text-slate-100 cursor-pointer font-medium"
                  >
                    {['LinkedIn Post', 'Portfolio Summary', 'Resume Summary'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={generateDigest}
                  disabled={loading}
                  className="w-full py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white cursor-pointer shadow-lg shadow-brand-500/10 flex items-center justify-center gap-1.5 transition"
                >
                  <BrainCircuit className="h-3.5 w-3.5" />
                  Synthesize achievements
                </button>
              </div>
            )}

            {/* Digest Output Preview */}
            {digestOutput && (
              <div className="flex flex-col gap-2 p-3 bg-slate-900/50 border border-slate-900 rounded-2xl relative">
                <span className="text-[10px] font-bold text-brand-300">Digest Output</span>
                <textarea
                  value={digestOutput}
                  readOnly
                  className="w-full min-h-[100px] text-xs leading-relaxed bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 outline-none resize-none font-sans"
                />
                <button
                  onClick={() => handleCopy(digestOutput, 'digest')}
                  className="absolute right-5 top-10 bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg border border-slate-700/50 cursor-pointer transition"
                >
                  {copied === 'digest' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'style' && (
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-1.5 bg-brand-950/15 border border-brand-900/20 p-3 rounded-2xl">
              <span className="text-xs font-bold text-brand-300">Signature Style Trainer</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Paste 1 or 2 examples of LinkedIn posts, articles, or comments you wrote. ContentPilot will analyze and replicate your voice exactly.
              </p>
            </div>

            <form onSubmit={trainStyleProfile} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Style Name</label>
                <input
                  type="text"
                  value={styleName}
                  onChange={(e) => setStyleName(e.target.value)}
                  className="text-xs bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 outline-none focus:border-brand-500 text-slate-100 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paste Sample Writing</label>
                <textarea
                  placeholder="Paste text example here..."
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  className="w-full min-h-[140px] text-xs bg-slate-900/50 border border-slate-800 rounded-xl p-3 outline-none focus:border-brand-500 text-slate-100 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white cursor-pointer shadow-lg shadow-brand-500/10 flex items-center justify-center gap-1.5 transition"
              >
                <PenTool className="h-4 w-4" />
                Train and Analyze Style
              </button>
            </form>

            {/* Active profile description */}
            {styles.length > 0 && (
              <div className="flex flex-col gap-2 p-3 bg-slate-900/20 border border-slate-900 rounded-2xl mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Analyzed Profile</span>
                <p className="text-[10px] text-slate-300 leading-relaxed max-h-[100px] overflow-y-auto pr-1">
                  {styles[0].analyzed_profile}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'grader' && (
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paste Draft Post/Copy</label>
              <textarea
                placeholder="Paste your post draft here..."
                value={gradeInputText}
                onChange={(e) => setGradeInputText(e.target.value)}
                className="w-full min-h-[160px] text-xs bg-slate-900/50 border border-slate-800 rounded-xl p-3 outline-none focus:border-brand-500 text-slate-100 resize-none font-sans"
              />
            </div>

            <button
              onClick={gradeCopy}
              disabled={loading || !gradeInputText.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white cursor-pointer shadow-lg shadow-brand-500/10 flex items-center justify-center gap-1.5 transition"
            >
              <BarChart3 className="h-4 w-4" />
              Analyze Post Quality
            </button>

            {/* Analysis Output */}
            {gradeOutput && (
              <div className="flex flex-col gap-3 py-1 mt-1">
                <div className="grid grid-cols-3 gap-2 py-1.5 bg-slate-900/40 border border-slate-900 rounded-2xl p-3">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Hook</span>
                    <span className={`text-sm font-extrabold mt-1 ${gradeOutput.hook >= 7 ? 'text-emerald-400' : gradeOutput.hook >= 4 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {gradeOutput.hook}/10
                    </span>
                  </div>
                  <div className="flex flex-col items-center border-x border-slate-800">
                    <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Storytelling</span>
                    <span className={`text-sm font-extrabold mt-1 ${gradeOutput.storytelling >= 7 ? 'text-emerald-400' : gradeOutput.storytelling >= 4 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {gradeOutput.storytelling}/10
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Engagement</span>
                    <span className={`text-sm font-extrabold mt-1 ${gradeOutput.engagement >= 7 ? 'text-emerald-400' : gradeOutput.engagement >= 4 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {gradeOutput.engagement}/10
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/50 border border-slate-900 rounded-2xl flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Coach Feedback</span>
                  <p className="text-[10px] text-slate-300 leading-relaxed">{gradeOutput.feedback}</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Bottom Footer Tab Navigation */}
      <div className="flex items-center justify-around border-t border-slate-900 bg-slate-950/80 px-4 py-2 glass">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${activeTab === 'dashboard' ? 'text-brand-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <History className="h-4 w-4" />
          <span className="text-[8px] font-bold tracking-wider uppercase">Activity</span>
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${activeTab === 'journal' ? 'text-brand-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <BookOpen className="h-4 w-4" />
          <span className="text-[8px] font-bold tracking-wider uppercase">Journal</span>
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${activeTab === 'style' ? 'text-brand-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <PenTool className="h-4 w-4" />
          <span className="text-[8px] font-bold tracking-wider uppercase">Style</span>
        </button>
        <button
          onClick={() => setActiveTab('grader')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition ${activeTab === 'grader' ? 'text-brand-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="text-[8px] font-bold tracking-wider uppercase">Grader</span>
        </button>
      </div>
    </div>
  );
}

// Render the application into root
const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<Popup />);
}
