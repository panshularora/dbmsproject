import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Zap, ChevronRight } from 'lucide-react';
import api from '../api/api';

const QueryVisualizer = () => {
  const [lastSql, setLastSql] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [explainData, setExplainData] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    const handleSql = (e) => {
      setLastSql(e.detail);
      setExplainData(null); // Reset explain on new query
    };
    window.addEventListener('sql-executed', handleSql);
    return () => window.removeEventListener('sql-executed', handleSql);
  }, []);

  const handleExplain = async () => {
    if (!lastSql || !lastSql.toLowerCase().startsWith('select')) return;
    setIsExplaining(true);
    try {
      const res = await api.post('/explain', { query: lastSql });
      setExplainData(res.data);
    } catch (err) {
      console.error('Explain failed:', err);
    } finally {
      setIsExplaining(false);
    }
  };

  const hasQuery = lastSql.length > 0;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className="bg-cems-blue text-white p-4 rounded-2xl shadow-2xl shadow-blue-500/40 hover:scale-105 transition-transform flex items-center gap-3 font-bold"
      >
        <Terminal size={20} />
        {isVisible ? 'Hide SQL Log' : 'SQL Visualizer'}
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[500px] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[600px]"
          >
            <div className="p-4 bg-gray-800/50 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Terminal size={14} />
                <span>Last Executed Query</span>
              </div>
              <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {hasQuery ? (
                <div className="bg-black/40 p-4 rounded-xl font-mono text-xs text-blue-300 leading-relaxed break-words border border-white/5">
                  {lastSql}
                </div>
              ) : (
                <div className="bg-black/40 p-4 rounded-xl font-mono text-xs text-gray-600 italic border border-white/5">
                  No query captured yet. Navigate around the portal to see live SQL queries appear here.
                </div>
              )}

              {lastSql.toLowerCase().startsWith('select') && (
                <button 
                  onClick={handleExplain}
                  disabled={isExplaining}
                  className="mt-4 w-full py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-500/20 transition-colors"
                >
                  <Zap size={14} />
                  {isExplaining ? 'Analyzing Plan...' : 'Run Explain Plan'}
                </button>
              )}

              {explainData && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 space-y-4"
                >
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Execution Strategy</div>
                  <div className="space-y-2">
                    {explainData.map((row, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 font-mono">Table: <span className="text-white font-bold">{row.table}</span></span>
                          <span className={`px-2 py-0.5 rounded-full font-black uppercase ${row.type === 'ALL' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {row.type}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-gray-500">
                          <div>Key Used: <span className="text-blue-400 font-bold">{row.key || 'None'}</span></div>
                          <div>Rows Scanned: <span className="text-white font-bold">{row.rows}</span></div>
                        </div>
                        {row.Extra && (
                          <div className="mt-2 pt-2 border-t border-white/5 text-gray-600 italic">
                            {row.Extra}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QueryVisualizer;
