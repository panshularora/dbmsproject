import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Book, ChevronRight, X } from 'lucide-react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ students: [], subjects: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const res = await api.get(`/search?q=${query}`);
          setResults(res.data);
          setIsOpen(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ students: [], subjects: [] });
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative w-96" ref={searchRef}>
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-blue-400' : 'text-gray-600'}`} size={18} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students, subjects..." 
          className="w-full bg-cems-bg/50 border border-white/5 rounded-2xl pl-12 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cems-purple/50 transition-all text-white"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (results.students.length > 0 || results.subjects.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-4 w-full bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-[1000] overflow-hidden"
          >
            <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
              {results.students.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 px-2">Students</p>
                  <div className="space-y-1">
                    {results.students.map((s) => (
                      <div key={s.student_id} className="p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{s.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{s.roll_no} • {s.course}</div>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-700 group-hover:text-blue-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.subjects.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 px-2">Subjects</p>
                  <div className="space-y-1">
                    {results.subjects.map((s) => (
                      <div key={s.subject_id} className="p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                            <Book size={14} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">{s.subject_name}</div>
                            <div className="text-[10px] text-gray-500">{s.credits} Credits</div>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-700 group-hover:text-purple-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 bg-white/2 border-t border-white/5 text-center">
              <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest italic">MySQL Full-Text Search</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
