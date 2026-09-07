import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  FileCode,
  Layers,
  Database,
  Server,
  Globe,
  Terminal,
  KeyRound
} from 'lucide-react';
import { BACKEND_TEMPLATES } from '../../data/backendCodeTemplates';

export const BackendCodeHub: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('sql');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeTemplate = BACKEND_TEMPLATES.find((t) => t.language === selectedLanguage) || BACKEND_TEMPLATES[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
            <Code2 className="w-3.5 h-3.5" /> Full Stack Foundation Backend Engine
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Multi-Language Backend Source Code Hub
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Production-ready backend microservices, relational SQL schemas, PHP PDO API scripts, Java Spring Boot controllers, aur Node.js REST routes for Bihar State Educational Development and Research Council (BSEDRC).
          </p>
        </div>

        <button
          onClick={() => handleDownload(activeTemplate.filename, activeTemplate.code)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>{activeTemplate.filename} Download Karein</span>
        </button>
      </div>

      {/* Tech Stack Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <button
          onClick={() => setSelectedLanguage('sql')}
          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
            selectedLanguage === 'sql'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black truncate">MySQL / SQL</div>
            <div className="text-[10px] opacity-70 truncate">DDL & Tables</div>
          </div>
        </button>

        <button
          onClick={() => setSelectedLanguage('php')}
          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
            selectedLanguage === 'php'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black truncate">PHP 8.x PDO</div>
            <div className="text-[10px] opacity-70 truncate">REST API Backend</div>
          </div>
        </button>

        <button
          onClick={() => setSelectedLanguage('java')}
          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
            selectedLanguage === 'java'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black truncate">Java Spring</div>
            <div className="text-[10px] opacity-70 truncate">Enterprise API</div>
          </div>
        </button>

        <button
          onClick={() => setSelectedLanguage('node')}
          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
            selectedLanguage === 'node'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black truncate">Node / Express</div>
            <div className="text-[10px] opacity-70 truncate">Active Dev Server</div>
          </div>
        </button>

        <button
          onClick={() => setSelectedLanguage('html')}
          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
            selectedLanguage === 'html'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black truncate">HTML5 / CSS3</div>
            <div className="text-[10px] opacity-70 truncate">Standalone Portal</div>
          </div>
        </button>

        <button
          onClick={() => setSelectedLanguage('env')}
          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
            selectedLanguage === 'env'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
            <KeyRound className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black truncate">.env Config</div>
            <div className="text-[10px] opacity-70 truncate">R2 & Razorpay Keys</div>
          </div>
        </button>
      </div>

      {/* Tech Overview Info Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">{activeTemplate.title}</h3>
            <p className="text-xs text-slate-600 mt-1">{activeTemplate.description}</p>
          </div>
          <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded font-bold border border-slate-200">
            {activeTemplate.filename}
          </span>
        </div>
      </div>

      {/* Code File Display */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-slate-200">{activeTemplate.filename}</span>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] uppercase font-mono">
              {activeTemplate.language}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(activeTemplate.code, activeTemplate.filename)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              {copiedKey === activeTemplate.filename ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownload(activeTemplate.filename, activeTemplate.code)}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-amber-500 selection:text-slate-950">
          <code>{activeTemplate.code}</code>
        </pre>
      </div>
    </div>
  );
};
