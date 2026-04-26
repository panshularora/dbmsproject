import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Malpractice = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get(`/malpractice/${user.id}`);
        setRecords(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchRecords();
  }, [user.id]);

  if (loading) return <div className="text-gray-500">Scanning records...</div>;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-white mb-3 italic tracking-tighter">Incident Reports</h1>
        <p className="text-gray-500 font-medium italic">Transparency and integrity records for your profile.</p>
      </header>

      {records.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {records.map((record) => (
            <motion.div 
              key={record.malpractice_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-[2.5rem] p-10 border border-red-500/10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 animate-pulse">
                  <AlertTriangle size={32} />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2 italic">{record.subject_name}</h3>
                    <div className="flex gap-4">
                      <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                        {record.status}
                      </span>
                      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-1">
                        <FileText size={12} /> Ref: #{record.registration_id}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 bg-cems-bg/50 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Description of Incident</p>
                    <p className="text-sm text-gray-400 leading-relaxed italic">"{record.description}"</p>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 p-4 bg-white/2 rounded-xl">
                      <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Reported By</p>
                      <p className="text-xs font-bold text-white">{record.reported_by}</p>
                    </div>
                    <div className="flex-1 p-4 bg-white/2 rounded-xl">
                      <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Action Taken</p>
                      <p className="text-xs font-bold text-red-400">{record.action_taken}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-[3rem] p-20 text-center border border-white/5 border-dashed"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center text-green-500 mx-auto mb-6 border border-green-500/20">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-white mb-2 italic">Clean Record</h3>
          <p className="text-gray-500 max-w-sm mx-auto">No disciplinary actions or malpractice incidents have been reported against your profile. Keep up the high academic standards!</p>
        </motion.div>
      )}
    </div>
  );
};

export default Malpractice;
