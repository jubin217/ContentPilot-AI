import styles from './index.css?inline';

// --- Type definitions ---
type TabType = 'generate' | 'rewrite' | 'analyze';

interface CopilotData {
  linkedin_post: string;
  resume_update: string;
  github_project_idea: string;
  interview_questions: string[];
}

interface PredictScores {
  hook: number;
  storytelling: number;
  engagement: number;
  feedback: string;
}

interface IconPath {
  tag: string;
  attrs: Record<string, string>;
}

interface IconsCollection {
  sparkles: IconPath[];
  copy: IconPath[];
  check: IconPath[];
  cornerDownLeft: IconPath[];
  chevronRight: IconPath[];
  fileText: IconPath[];
  mail: IconPath[];
  github: IconPath[];
  award: IconPath[];
  hash: IconPath[];
  barChart2: IconPath[];
  eye: IconPath[];
  shieldAlert: IconPath[];
}

// --- SVG paths definitions ---
const icons: IconsCollection = {
  sparkles: [{ tag: "path", attrs: { d: "M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z", fill: "currentColor", stroke: "none" } }],
  copy: [
    { tag: "rect", attrs: { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" } },
    { tag: "path", attrs: { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" } }
  ],
  check: [{ tag: "path", attrs: { d: "M20 6L9 17L4 12" } }],
  cornerDownLeft: [
    { tag: "path", attrs: { d: "M9 10l-5 5 5 5" } },
    { tag: "path", attrs: { d: "M20 4v7a4 4 0 0 1-4 4H4" } }
  ],
  chevronRight: [{ tag: "path", attrs: { d: "M9 18l6-6-6-6" } }],
  fileText: [
    { tag: "path", attrs: { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" } },
    { tag: "path", attrs: { d: "M14 2v4a2 2 0 0 0 2 2h4" } },
    { tag: "line", attrs: { x1: "10", y1: "9", x2: "14", y2: "9" } },
    { tag: "line", attrs: { x1: "10", y1: "13", x2: "16", y2: "13" } },
    { tag: "line", attrs: { x1: "10", y1: "17", x2: "16", y2: "17" } }
  ],
  mail: [
    { tag: "rect", attrs: { width: "20", height: "16", x: "2", y: "4", rx: "2" } },
    { tag: "path", attrs: { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" } }
  ],
  github: [{ tag: "path", attrs: { d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" } }],
  award: [
    { tag: "circle", attrs: { cx: "12", cy: "8", r: "7" } },
    { tag: "path", attrs: { d: "M8.21 13.89L7 23l5-3 5 3-1.21-9.12" } }
  ],
  hash: [
    { tag: "line", attrs: { x1: "4", y1: "9", x2: "20", y2: "9" } },
    { tag: "line", attrs: { x1: "4", y1: "15", x2: "20", y2: "15" } },
    { tag: "line", attrs: { x1: "10", y1: "3", x2: "8", y2: "21" } },
    { tag: "line", attrs: { x1: "16", y1: "3", x2: "14", y2: "21" } }
  ],
  barChart2: [
    { tag: "line", attrs: { x1: "18", y1: "20", x2: "18", y2: "10" } },
    { tag: "line", attrs: { x1: "12", y1: "20", x2: "12", y2: "4" } },
    { tag: "line", attrs: { x1: "6", y1: "20", x2: "6", y2: "14" } }
  ],
  eye: [
    { tag: "path", attrs: { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" } },
    { tag: "circle", attrs: { cx: "12", cy: "12", r: "3" } }
  ],
  shieldAlert: [
    { tag: "path", attrs: { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" } },
    { tag: "line", attrs: { x1: "12", y1: "8", x2: "12", y2: "12" } },
    { tag: "line", attrs: { x1: "12", y1: "16", x2: "12.01", y2: "16" } }
  ]
};

// --- DOM elements creation helpers ---
function el(tag: string, className = "", children: (Element | string)[] = [], attrs: Record<string, string> = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  }
  for (const [key, val] of Object.entries(attrs)) {
    element.setAttribute(key, val);
  }
  return element;
}

function createSvg(paths: IconPath[], className = "h-4 w-4"): any {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", className);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  
  for (const p of paths) {
    const child = document.createElementNS(ns, p.tag);
    for (const [k, v] of Object.entries(p.attrs)) {
      child.setAttribute(k, v);
    }
    svg.appendChild(child);
  }
  return svg;
}

function getEditableContainer(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'text')) {
    return el;
  }
  const editable = el.closest('[contenteditable]');
  if (editable && editable.getAttribute('contenteditable') !== 'false') {
    return editable as HTMLElement;
  }
  return null;
}

// --- Controller logic ---
class ContentPilotController {
  private activeEl: HTMLElement | null = null;
  private coords: { top: number; left: number } | null = null;
  private hasContent = false;
  
  // Widget elements inside Shadow DOM
  private wrapper: HTMLDivElement;
  private toggleBtn: HTMLButtonElement | null = null;
  private dropdownPanel: HTMLDivElement | null = null;
  
  // UI states
  private isOpen = false;
  private activeTab: TabType = 'generate';
  private loading = false;
  private copied = false;
  private error = '';
  private outputText = '';
  
  // Analytics details
  private detectedTone = '';
  private scores: PredictScores | null = null;
  private copilotData: CopilotData | null = null;

  constructor(shadowRoot: ShadowRoot) {
    this.wrapper = el('div', 'font-sans text-slate-100 antialiased select-none pointer-events-auto') as HTMLDivElement;
    this.wrapper.style.pointerEvents = 'auto';
    shadowRoot.appendChild(this.wrapper);
    
    this.setupListeners();
    this.render();
  }

  private setupListeners() {
    const checkElementContent = (el: HTMLElement) => {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        return el.value.trim().length > 0;
      }
      return (el.innerText || '').trim().length > 0;
    };

    const updatePosition = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      this.coords = {
        top: rect.bottom + window.scrollY - 38,
        left: rect.right + window.scrollX - 42
      };
      if (this.wrapper) {
        this.wrapper.style.position = 'absolute';
        this.wrapper.style.top = `${this.coords.top}px`;
        this.wrapper.style.left = `${this.coords.left}px`;
      }
    };

    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      const container = getEditableContainer(target);
      if (container) {
        this.activeEl = container;
        this.hasContent = checkElementContent(container);
        updatePosition(container);
        this.render();
      } else {
        const host = document.getElementById('content-pilot-extension-root');
        if (host && (target === host || host.contains(target))) {
          return;
        }
        const path = e.composedPath();
        if (this.wrapper && path.includes(this.wrapper)) {
          return;
        }
        this.activeEl = null;
        this.render();
      }
    });

    document.addEventListener('input', (e) => {
      const target = e.target as HTMLElement;
      const container = getEditableContainer(target);
      if (container && this.activeEl === container) {
        this.hasContent = checkElementContent(container);
        updatePosition(container);
        this.render();
      }
    });

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const container = getEditableContainer(target);
      if (container) {
        this.activeEl = container;
        this.hasContent = checkElementContent(container);
        updatePosition(container);
        this.render();
      }
    });

    const handleScrollOrResize = () => {
      if (this.activeEl) {
        updatePosition(this.activeEl);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    // Click outside handler (handles Shadow DOM composedPath correctly)
    document.addEventListener('mousedown', (event) => {
      const path = event.composedPath();
      if (this.isOpen && !this.loading) {
        if (this.dropdownPanel && path.includes(this.dropdownPanel)) {
          return;
        }
        if (this.toggleBtn && path.includes(this.toggleBtn)) {
          return;
        }
        this.isOpen = false;
        this.render();
      }
    });
  }

  private getInputValue() {
    if (!this.activeEl) return '';
    const selection = window.getSelection()?.toString();
    if (selection && selection.trim().length > 0) {
      return selection.trim();
    }
    if (this.activeEl instanceof HTMLInputElement || this.activeEl instanceof HTMLTextAreaElement) {
      return this.activeEl.value;
    }
    return this.activeEl.innerText || '';
  }

  private callAPI(endpoint: string, payload: any): Promise<any> {
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
  }

  private async handleAction(type: string, param: string) {
    const rawText = this.getInputValue();
    if (!rawText.trim()) {
      this.error = "Please type some text in the field first.";
      this.render();
      return;
    }

    this.loading = true;
    this.error = '';
    this.outputText = '';
    this.scores = null;
    this.detectedTone = '';
    this.copilotData = null;
    this.render();

    try {
      if (type === 'generate') {
        const res = await this.callAPI('/api/generate', {
          text: rawText,
          format: param,
          style: 'Professional'
        });
        this.outputText = res.output_text;
      } else if (type === 'rewrite') {
        const res = await this.callAPI('/api/rewrite', {
          text: rawText,
          action: param
        });
        this.outputText = res.output_text;
      } else if (type === 'tone') {
        const res = await this.callAPI('/api/tone', { text: rawText });
        this.detectedTone = res.detected_tone;
        this.outputText = res.professional_reply;
      } else if (type === 'engagement') {
        const res = await this.callAPI('/api/predict-engagement', { text: rawText });
        this.scores = res.scores;
        this.outputText = res.scores.feedback;
      } else if (type === 'copilot') {
        const res = await this.callAPI('/api/career-copilot', { achievement: rawText });
        this.copilotData = res;
        this.outputText = res.linkedin_post;
      }
    } catch (err: any) {
      console.error(err);
      this.error = err.message || "Could not generate content. Please make sure the backend server is running.";
    } finally {
      this.loading = false;
      this.render();
    }
  }

  private handleInsertText() {
    if (!this.activeEl) return;
    const text = this.outputText;
    
    this.activeEl.focus();
    
    try {
      const inserted = document.execCommand('insertText', false, text);
      if (!inserted) {
        throw new Error('execCommand returned false');
      }
    } catch (e) {
      console.warn('execCommand failed, falling back to manual insertion:', e);
      if (this.activeEl instanceof HTMLInputElement || this.activeEl instanceof HTMLTextAreaElement) {
        const start = this.activeEl.selectionStart || 0;
        const end = this.activeEl.selectionEnd || 0;
        const val = this.activeEl.value;
        this.activeEl.value = val.substring(0, start) + text + val.substring(end);
        
        this.activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        this.activeEl.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        this.activeEl.innerText = text;
        this.activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    
    this.isOpen = false;
    this.render();
  }

  private handleCopy() {
    navigator.clipboard.writeText(this.outputText);
    this.copied = true;
    this.render();
    setTimeout(() => {
      this.copied = false;
      this.render();
    }, 2000);
  }

  private render() {
    // Clear wrapper contents
    while (this.wrapper.firstChild) {
      this.wrapper.removeChild(this.wrapper.firstChild);
    }

    if (!this.activeEl || !this.coords || !this.hasContent) {
      this.wrapper.style.display = 'none';
      return;
    }
    
    this.wrapper.style.display = 'block';

    if (!this.isOpen) {
      // Render floating toggle button
      this.toggleBtn = el('button', 'flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-indigo-600 shadow-lg shadow-brand-500/20 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border border-brand-400/20', [
        createSvg(icons.sparkles, 'h-4.5 w-4.5 text-white animate-pulse')
      ]) as HTMLButtonElement;
      
      this.toggleBtn.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isOpen = true;
        this.render();
      };
      this.wrapper.appendChild(this.toggleBtn);
      this.dropdownPanel = null;
    } else {
      // Render dropdown panel
      this.toggleBtn = null;
      this.dropdownPanel = el('div', 'absolute right-0 bottom-11 w-80 rounded-2xl border border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden max-h-[480px]') as HTMLDivElement;

      this.dropdownPanel.onmousedown = (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
          e.preventDefault();
        }
        e.stopPropagation();
      };

      // 1. Panel Header
      const closeBtn = el('button', 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg px-2 py-1 transition cursor-pointer text-xs', ['Close']) as HTMLButtonElement;
      closeBtn.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isOpen = false;
        this.render();
      };

      const header = el('div', 'flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-900', [
        el('div', 'flex items-center gap-2', [
          el('div', 'flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600', [
            createSvg(icons.sparkles, 'h-3.5 w-3.5 text-white')
          ]),
          el('span', 'font-semibold text-sm tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent', ['LinkedIn Paragraph Creator'])
        ]),
        closeBtn
      ]);
      this.dropdownPanel.appendChild(header);

      // 2. Panel Body
      const body = el('div', 'flex-1 overflow-y-auto p-4 flex flex-col min-h-[220px]');
      this.dropdownPanel.appendChild(body);

      if (this.loading) {
        // Loading view
        const loadingView = el('div', 'flex-1 flex flex-col items-center justify-center gap-4 py-8', [
          el('div', 'relative flex items-center justify-center', [
            el('div', 'h-10 w-10 animate-spin rounded-full border-2 border-brand-500/20 border-t-brand-500'),
            createSvg(icons.sparkles, 'absolute h-4 w-4 text-brand-400 animate-pulse')
          ]),
          el('div', 'flex flex-col items-center text-center', [
            el('span', 'text-sm font-medium text-slate-200', ['Writing copy...']),
            el('span', 'text-xs text-slate-500 mt-1', ['Calling nvidia Nemotron-3 (550B)'])
          ])
        ]);
        body.appendChild(loadingView);
      } else if (this.error) {
        // Error view
        const errorBtn = el('button', 'mt-2 text-xs font-semibold px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 transition cursor-pointer', ['Go Back']);
        errorBtn.onclick = () => {
          this.error = '';
          this.render();
        };
        const errorView = el('div', 'flex-1 flex flex-col items-center justify-center gap-3 py-6 text-center', [
          createSvg(icons.shieldAlert, 'h-8 w-8 text-rose-500'),
          el('span', 'text-xs text-slate-300 px-4 leading-relaxed font-medium', [this.error]),
          errorBtn
        ]);
        body.appendChild(errorView);
      } else if (this.outputText || this.copilotData) {
        // Output Preview view
        const previewView = el('div', 'flex-grow flex flex-col gap-3');
        body.appendChild(previewView);

        if (this.detectedTone) {
          previewView.appendChild(el('div', 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-900/30 text-indigo-300 text-xs font-medium self-start', [
            createSvg(icons.award, 'h-3.5 w-3.5'),
            'Detected Tone: ',
            el('span', 'font-bold text-indigo-200', [this.detectedTone])
          ]));
        }

        if (this.scores) {
          const scoreClass = (score: number) => score >= 7 ? 'text-emerald-400' : score >= 4 ? 'text-amber-400' : 'text-rose-400';
          previewView.appendChild(el('div', 'grid grid-cols-3 gap-2 py-1 bg-slate-900/40 border border-slate-900 rounded-xl p-2.5', [
            el('div', 'flex flex-col items-center', [
              el('span', 'text-[10px] text-slate-400 font-semibold tracking-wider uppercase', ['Hook']),
              el('span', `text-sm font-bold mt-1 ${scoreClass(this.scores.hook)}`, [`${this.scores.hook}/10`])
            ]),
            el('div', 'flex flex-col items-center border-x border-slate-800', [
              el('span', 'text-[10px] text-slate-400 font-semibold tracking-wider uppercase', ['Story']),
              el('span', `text-sm font-bold mt-1 ${scoreClass(this.scores.storytelling)}`, [`${this.scores.storytelling}/10`])
            ]),
            el('div', 'flex flex-col items-center', [
              el('span', 'text-[10px] text-slate-400 font-semibold tracking-wider uppercase', ['Engage']),
              el('span', `text-sm font-bold mt-1 ${scoreClass(this.scores.engagement)}`, [`${this.scores.engagement}/10`])
            ])
          ]));
        }

        if (this.copilotData) {
          const copilotTabs = el('div', 'flex bg-slate-900/50 p-1.5 rounded-lg border border-slate-900 gap-1.5 text-[11px] font-semibold');
          previewView.appendChild(copilotTabs);

          const tabBtn = (label: string, text: string) => {
            const btn = el('button', `flex-1 py-1 rounded text-center cursor-pointer transition ${this.outputText === text ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, [label]);
            btn.onclick = () => {
              this.outputText = text;
              this.render();
            };
            return btn;
          };

          copilotTabs.appendChild(tabBtn('Post', this.copilotData.linkedin_post));
          copilotTabs.appendChild(tabBtn('Resume', this.copilotData.resume_update));
          copilotTabs.appendChild(tabBtn('GitHub', this.copilotData.github_project_idea));
          copilotTabs.appendChild(tabBtn('Q&A', this.copilotData.interview_questions.join('\n\n')));
        }

        // Preview text area container
        const textareaContainer = el('div', 'relative flex-1 flex flex-col');
        previewView.appendChild(textareaContainer);

        const textarea = el('textarea', 'flex-grow w-full min-h-[140px] text-xs leading-relaxed bg-slate-900/70 border border-slate-800 rounded-xl p-3 outline-none focus:border-brand-500 text-slate-100 resize-none font-sans', [], {
          value: this.outputText
        }) as HTMLTextAreaElement;
        textarea.value = this.outputText;
        textarea.oninput = (e) => {
          this.outputText = (e.target as HTMLTextAreaElement).value;
        };
        textareaContainer.appendChild(textarea);

        // Copy button
        const copyBtn = el('button', 'absolute right-2.5 top-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white p-1.5 rounded-lg border border-slate-700/50 cursor-pointer transition', [
          createSvg(this.copied ? icons.check : icons.copy, 'h-3.5 w-3.5 ' + (this.copied ? 'text-emerald-400' : ''))
        ]);
        copyBtn.onclick = () => this.handleCopy();
        textareaContainer.appendChild(copyBtn);

        // Confirm buttons
        const backBtn = el('button', 'flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer', ['Back']);
        backBtn.onclick = () => {
          this.outputText = '';
          this.copilotData = null;
          this.scores = null;
          this.detectedTone = '';
          this.render();
        };

        const insertBtn = el('button', 'flex-[1.5] py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/10 flex items-center justify-center gap-1.5 cursor-pointer transition', [
          createSvg(icons.cornerDownLeft, 'h-3.5 w-3.5'),
          'Insert'
        ]);
        insertBtn.onclick = () => this.handleInsertText();

        previewView.appendChild(el('div', 'flex gap-2 mt-1', [backBtn, insertBtn]));
      } else {
        // Menu view
        const menuView = el('div', 'flex-1 flex flex-col');
        body.appendChild(menuView);

        // Tabs navigation
        const tabBtn = (tab: TabType, label: string) => {
          const btn = el('button', `flex-1 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${this.activeTab === tab ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`, [label]);
          btn.onclick = () => {
            this.activeTab = tab;
            this.render();
          };
          return btn;
        };

        menuView.appendChild(el('div', 'flex border-b border-slate-900 mb-4 bg-slate-900/10 p-0.5 rounded-lg', [
          tabBtn('generate', 'Generate'),
          tabBtn('rewrite', 'Rewrite'),
          tabBtn('analyze', 'Analyze')
        ]));

        const tabContent = el('div', 'flex-grow flex flex-col justify-start');
        menuView.appendChild(tabContent);

        if (this.activeTab === 'generate') {
          const grid = el('div', 'grid grid-cols-2 gap-2');
          tabContent.appendChild(grid);

          const genBtn = (label: string, param: string, iconPaths: any[], iconColor: string) => {
            const btn = el('button', 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900 hover:border-slate-800 text-left text-xs font-medium cursor-pointer transition group', [
              createSvg(iconPaths, 'h-4 w-4 ' + iconColor + ' group-hover:scale-110 transition duration-150'),
              label
            ]);
            btn.onclick = () => this.handleAction('generate', param);
            return btn;
          };

          grid.appendChild(genBtn('LinkedIn Post', 'LinkedIn Post', icons.fileText, 'text-sky-400'));
          grid.appendChild(genBtn('Resume Bullet', 'Resume Bullet', icons.award, 'text-emerald-400'));
          grid.appendChild(genBtn('Cover Letter', 'Cover Letter Paragraph', icons.mail, 'text-violet-400'));
          grid.appendChild(genBtn('GitHub README', 'GitHub README', icons.github, 'text-slate-300'));
          grid.appendChild(genBtn('Email Draft', 'Professional Email', icons.mail, 'text-amber-400'));
          grid.appendChild(genBtn('Twitter Thread', 'Twitter/X Thread', icons.hash, 'text-brand-400'));
        } else if (this.activeTab === 'rewrite') {
          const list = el('div', 'flex flex-col gap-2');
          tabContent.appendChild(list);

          const actions = ['Shorten', 'Expand', 'Professionalize', 'Simplify', 'Improve Grammar', 'Add Storytelling'];
          for (const act of actions) {
            const btn = el('button', 'flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-900 bg-slate-900/10 hover:bg-slate-900 hover:border-slate-800 text-xs font-medium cursor-pointer transition group', [
              el('span', 'text-slate-200', [act]),
              createSvg(icons.chevronRight, 'h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition duration-150')
            ]);
            btn.onclick = () => this.handleAction('rewrite', act);
            list.appendChild(btn);
          }
        } else if (this.activeTab === 'analyze') {
          const list = el('div', 'flex flex-col gap-2');
          tabContent.appendChild(list);

          const analyzeBtn = (label: string, desc: string, iconPaths: any[], iconColor: string, actionKey: string) => {
            const btn = el('button', 'flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900 hover:border-slate-800 text-left text-xs font-semibold cursor-pointer transition group', [
              createSvg(iconPaths, 'h-4 w-4 ' + iconColor + ' group-hover:scale-110 transition duration-150'),
              el('div', 'flex flex-col', [
                el('span', '', [label]),
                el('span', 'text-[10px] font-normal text-slate-500 mt-0.5', [desc])
              ])
            ]);
            btn.onclick = () => this.handleAction(actionKey, '');
            return btn;
          };

          list.appendChild(analyzeBtn('AI Tone Detector', 'Analyzes writing tone and drafts reply', icons.eye, 'text-indigo-400', 'tone'));
          list.appendChild(analyzeBtn('Engagement Predictor', 'Grades Hook, Story, and Engagement', icons.barChart2, 'text-emerald-400', 'engagement'));
          list.appendChild(analyzeBtn('AI Career Copilot', 'Suggests post, resume edit, & code project', icons.award, 'text-brand-400', 'copilot'));
        }
      }

      // 3. Panel Footer
      const footer = el('div', 'px-4 py-2 border-t border-slate-900 bg-slate-950 flex items-center justify-between text-[9px] text-slate-500', [
        el('span', '', ['Powered by Nemotron-3 (550B)']),
        el('span', '', ['LinkedIn Paragraph Creator'])
      ]);
      this.dropdownPanel.appendChild(footer);

      this.wrapper.appendChild(this.dropdownPanel);
    }
  }
}

// --- Bootstrap injection ---
function initializeExtension() {
  const containerId = 'content-pilot-extension-root';
  let container = document.getElementById(containerId);
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    const shadowRoot = container.attachShadow({ mode: 'open' });

    // Append stylesheet
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    shadowRoot.appendChild(styleEl);

    // Boot class-based Vanilla JS controller
    new ContentPilotController(shadowRoot);
  }
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeExtension();
} else {
  window.addEventListener('DOMContentLoaded', initializeExtension);
}
