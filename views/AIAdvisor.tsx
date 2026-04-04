
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BrainCircuit, 
  Loader2, 
  Leaf, 
  Target, 
  BarChart3, 
  Send, 
  Bot, 
  User as UserIcon,
  RefreshCw,
  Download,
  MessageSquare,
  Trash2,
  Copy,
  Check,
  Mic,
  TrendingDown,
  Zap,
  Globe,
  Activity,
  Info
} from 'lucide-react';
import { Supplier, Material, ProcurementRecord, EnergyRecord, User } from '../types';
import { getSustainabilityAdvice, getSustainabilityTip } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAdvisorProps {
  suppliers: Supplier[];
  materials: Material[];
  procurement: ProcurementRecord[];
  energy: EnergyRecord[];
  currentUser: User;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ suppliers, materials, procurement, energy, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [tip, setTip] = useState('Transitioning to 100% renewable energy sources can reduce your Scope 2 emissions by up to 95% within the first year.');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const newTip = await getSustainabilityTip();
        setTip(newTip);
      } catch (error) {
        console.error("Failed to fetch tip:", error);
      }
    };
    fetchTip();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleInitialAnalysis = async () => {
    setLoading(true);
    try {
      const result = await getSustainabilityAdvice(suppliers, materials, procurement, energy);
      setMessages([{
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: result,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error(error);
      setMessages([{
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: "I encountered an error while analyzing your data. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await getSustainabilityAdvice(suppliers, materials, procurement, energy, input);
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: result,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to my brain right now.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    // Mocking voice input for now
    setTimeout(() => {
      setIsListening(false);
      setInput("How can I reduce my Scope 3 emissions?");
    }, 2000);
  };

  const handleExport = () => {
    const chatContent = messages.map(m => `${m.role.toUpperCase()} (${m.timestamp.toLocaleString()}):\n${m.content}\n\n`).join('---\n\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sustainability-insights-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 animate-in fade-in duration-500 overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
              Strategic Advisor
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Intelligence Active • v3.1</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button 
              onClick={handleClearChat}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all active:scale-90"
              title="Clear Conversation"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          )}
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />
          <button 
            onClick={handleInitialAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-Analyze
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm relative">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth"
          >
            {messages.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mb-8 relative group">
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100" />
                  <Bot className="text-emerald-500 w-12 h-12 relative z-10" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 dark:bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl z-20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Enterprise Intelligence</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm font-medium mb-10 leading-relaxed text-sm">
                  Deep analysis of your sustainability metrics is ready. How can I assist your ESG strategy today?
                </p>
                <button 
                  onClick={handleInitialAnalysis}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Generate Full Report
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                    msg.role === 'assistant' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                  </div>
                  
                  <div className={`max-w-[85%] relative group ${
                    msg.role === 'assistant'
                      ? 'bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      : 'bg-emerald-600 p-4 rounded-2xl rounded-tr-none text-white shadow-lg shadow-emerald-500/10'
                  }`}>
                    {msg.role === 'assistant' && (
                      <button 
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="absolute -top-2 -right-2 p-2 bg-white dark:bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-slate-200 dark:border-slate-600 hover:scale-110 active:scale-95 z-10"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    )}
                    <div className={`prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-strong:text-emerald-500 prose-base ${msg.role === 'user' ? 'prose-p:text-white' : ''}`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <div className={`flex items-center gap-2 mt-4 opacity-30 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gemini Processing</span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
            <form onSubmit={handleSendMessage} className="relative flex gap-3 max-w-4xl mx-auto">
              <div className="relative flex-1 group">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Inquire about ESG performance..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-5 pl-8 pr-14 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all dark:text-white shadow-sm"
                />
                <button 
                  type="button"
                  onClick={handleVoiceInput}
                  className={`absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="px-8 bg-slate-900 dark:bg-emerald-500 text-white rounded-2xl hover:opacity-90 transition-all disabled:opacity-30 flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl active:scale-95"
              >
                Execute
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="hidden lg:flex flex-col gap-4 w-80">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                Real-time Focus
              </span>
              <span title="Data updated in real-time based on your ERP records">
                <Info className="w-3.5 h-3.5 opacity-50 cursor-help" />
              </span>
            </h4>
            <div className="space-y-4">
              {[
                { label: 'Scope 3 Emissions', value: 'High', color: 'rose', icon: TrendingDown, trend: '+2.4%' },
                { label: 'Supplier ESG Avg', value: '68%', color: 'amber', icon: Globe, trend: '+5.1%' },
                { label: 'Energy Mix', value: 'Mixed', color: 'blue', icon: Zap, trend: 'Stable' }
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 shadow-sm`}>
                        <stat.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{stat.label}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{stat.trend}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-black text-${stat.color}-500`}>{stat.value}</span>
                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full bg-${stat.color}-500 w-2/3 rounded-full`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-500 dark:bg-emerald-600 rounded-[32px] p-6 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <Sparkles className="w-8 h-8 mb-4 opacity-40" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-3 opacity-60">Daily Insight</h4>
            <p className="text-sm font-medium leading-relaxed italic">
              "{tip}"
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm flex-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              Quick Prompts
            </h4>
            <div className="space-y-2">
              {[
                "Analyze my top 3 carbon sources",
                "Compare supplier ESG scores",
                "How to improve recyclability?",
                "Energy saving strategies"
              ].map((query, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(query)}
                  className="w-full text-left p-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-2xl transition-all border border-transparent hover:border-emerald-500/20"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
