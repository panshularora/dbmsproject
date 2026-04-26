import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, Zap, CheckCircle, DatabaseZap, Layout, BarChart3 } from 'lucide-react';
import api from '../api/api';

const DatabaseSchema = () => {
  const [query, setQuery] = useState('SELECT * FROM students WHERE roll_no = "CS101"');
  const [explainResult, setExplainResult] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/subjects');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExplain = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/explain', { query });
      setExplainResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const tables = [
    { name: 'students', pk: 'student_id', fds: 'student_id -> roll_no, name, course, semester, email, gpa', nf: 'BCNF' },
    { name: 'subjects', pk: 'subject_id', fds: 'subject_id -> subject_name, credits, semester', nf: 'BCNF' },
    { name: 'exam_registrations', pk: 'registration_id', fds: 'registration_id -> student_id, subject_id, exam_id', nf: '3NF' },
    { name: 'evaluations', pk: 'evaluation_id', fds: 'evaluation_id -> registration_id, faculty_id, marks, grade', nf: '3NF' },
    { name: 'hall_allocations', pk: 'allocation_id', fds: 'allocation_id -> registration_id, hall_id, seat_no', nf: '3NF' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 py-8">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl">
            <Database size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter">Database Architecture</h1>
            <p className="text-gray-400 font-medium mt-1">Schema, Normalization (3NF/BCNF) & Query Optimization</p>
          </div>
        </div>
      </header>

      {/* Normalization Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="glass-card p-8 rounded-[2rem] border border-white/10 lg:col-span-1">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <CheckCircle className="text-green-400" />
            Normalization (BCNF)
          </h2>
          <div className="space-y-4">
            {tables.map((t, idx) => (
              <div key={idx} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-blue-400 text-sm">{t.name}</span>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-black rounded-full uppercase">{t.nf}</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  PK: <span className="text-yellow-400">{t.pk}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Database Views section */}
        <motion.div className="glass-card p-8 rounded-[2rem] border border-white/10 lg:col-span-1">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Layout className="text-purple-400" />
            Virtual Views
          </h2>
          <div className="space-y-4">
            {[
              { name: 'vw_student_results', desc: 'Encapsulates complex JOINs for academic records' },
              { name: 'vw_hall_occupancy', desc: 'Real-time monitoring of exam hall availability' },
              { name: 'vw_subject_analytics', desc: 'Aggregated statistical metrics per subject' }
            ].map((v, idx) => (
              <div key={idx} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="font-bold text-purple-400 text-sm mb-1">{v.name}</div>
                <div className="text-[10px] text-gray-400 leading-relaxed">{v.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Query Optimization section */}
        <motion.div className="glass-card p-8 rounded-[2rem] border border-white/10 lg:col-span-1 flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <DatabaseZap className="text-yellow-400" />
            Optimization
          </h2>
          <p className="text-gray-400 text-xs mb-6">
            Test B-Tree indexes (`idx_student_roll`, `idx_reg_student`) via EXPLAIN.
          </p>

          <div className="flex-1 flex flex-col gap-4">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-24 bg-gray-900/50 border border-gray-700 rounded-xl p-3 text-xs font-mono text-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleExplain}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs"
            >
              <Zap size={14} /> {loading ? 'Analyzing...' : 'Run EXPLAIN Plan'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Analytics Display */}
      {analytics.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-[2rem] border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <BarChart3 className="text-orange-400" />
            Live Subject Analytics (Powered by View)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.map((s, idx) => (
              <div key={idx} className="p-6 bg-white/5 rounded-[1.5rem] border border-white/5 relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-white font-bold mb-4">{s.subject_name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 p-3 rounded-xl">
                      <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Avg Marks</div>
                      <div className="text-xl font-black text-orange-400">{Number(s.average_marks || 0).toFixed(1)}</div>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-xl">
                      <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Max Marks</div>
                      <div className="text-xl font-black text-green-400">{Number(s.highest_marks || 0).toFixed(0)}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500">
                    <span>Total Reg: {s.total_registrations}</span>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full font-bold uppercase tracking-tighter">View Data</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Explain Table */}
      {explainResult && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900 rounded-[2rem] overflow-hidden border border-gray-800 shadow-2xl"
        >
          <div className="p-4 bg-gray-800/50 border-b border-gray-800 font-mono text-xs text-gray-400">Execution Plan Output</div>
          <div className="p-8 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="pb-4 pr-6">id</th>
                  <th className="pb-4 pr-6">select_type</th>
                  <th className="pb-4 pr-6">table</th>
                  <th className="pb-4 pr-6">type</th>
                  <th className="pb-4 pr-6">possible_keys</th>
                  <th className="pb-4 pr-6">key</th>
                  <th className="pb-4 pr-6">rows</th>
                  <th className="pb-4">Extra</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {explainResult.map((row, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-6">{row.id}</td>
                    <td className="py-4 pr-6 text-blue-400">{row.select_type}</td>
                    <td className="py-4 pr-6 font-bold">{row.table}</td>
                    <td className="py-4 pr-6 text-yellow-400">{row.type}</td>
                    <td className="py-4 pr-6 italic text-gray-500">{row.possible_keys || 'NULL'}</td>
                    <td className="py-4 pr-6 font-bold text-green-400">{row.key || 'NULL'}</td>
                    <td className="py-4 pr-6">{row.rows}</td>
                    <td className="py-4 text-gray-400 italic">{row.Extra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DatabaseSchema;
