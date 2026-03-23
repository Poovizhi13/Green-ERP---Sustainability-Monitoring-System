
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
  MessageSquare
} from 'lucide-react';
import { Supplier, Material, ProcurementRecord, EnergyRecord, User } from '../types';
import { getSustainabilityAdvice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Message {
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
        role: 'assistant',
        content: result,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error(error);
      setMessages([{
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
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Pass the user's input as the query
      const result = await getSustainabilityAdvice(suppliers, materials, procurement, energy, input);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to my brain right now.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BrainCircuit className="text-emerald-500 w-8 h-8" />
            AI Sustainability Advisor
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
            "Harnessing Gemini 3.1 for deep environmental intelligence."
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleInitialAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Full Re-Analysis
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            <Download className="w-4 h-4" />
            Export Insights
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden relative">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            {messages.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                  <Bot className="text-emerald-500 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Welcome, {currentUser.username}</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium mb-8">
                  I am your dedicated Sustainability Advisor. I've analyzed your enterprise data and I'm ready to help you optimize your environmental impact.
                </p>
                <button 
                  onClick={handleInitialAnalysis}
                  className="bg-slate-900 dark:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-emerald-500/20"
                >
                  Start Strategic Analysis
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                    msg.role === 'assistant' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                  </div>
                  
                  <div className={`max-w-[85%] p-6 rounded-3xl shadow-sm border ${
                    msg.role === 'assistant'
                      ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      : 'bg-emerald-600 text-white border-emerald-500'
                  }`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-black prose-p:leading-relaxed prose-strong:text-emerald-500">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <p className={`text-[10px] mt-4 font-bold uppercase tracking-widest opacity-40 ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
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
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center animate-pulse">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-tight">Gemini is thinking...</span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about carbon reduction, supplier scores, or energy efficiency..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-6 pr-16 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:hover:bg-emerald-500"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-3 font-bold uppercase tracking-widest">
              AI can make mistakes. Verify critical environmental data.
            </p>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="hidden lg:flex flex-col gap-6 w-80">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              Focus Areas
            </h4>
            <div className="space-y-4">
              {[
                { label: 'Scope 3 Emissions', value: 'High', color: 'rose' },
                { label: 'Supplier ESG Avg', value: '68%', color: 'amber' },
                { label: 'Energy Mix', value: 'Mixed', color: 'blue' }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{stat.label}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded bg-${stat.color}-500/10 text-${stat.color}-500`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[32px] p-6 text-white shadow-xl shadow-emerald-500/20">
            <Sparkles className="w-8 h-8 mb-4 opacity-50" />
            <h4 className="text-lg font-black leading-tight mb-2">Sustainability Tip</h4>
            <p className="text-sm font-medium opacity-90 leading-relaxed">
              Transitioning to 100% renewable energy sources can reduce your Scope 2 emissions by up to 95% within the first year.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 shadow-xl flex-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Suggested Queries
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
                  className="w-full text-left p-3 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
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
