import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Plus, Search, Filter, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FacultyMalpractice = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    registration_id: '',
    student_id: '',
    student_name: '',
    roll_no: '',
    subject_name: '',
    description: '',
    reported_by: user.name,
    action_taken: 'Under Investigation',
    status: 'Pending'
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get('/malpractice');
      setRecords(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { registration_id, description, action_taken, status, reported_by } = formData;
      await api.post('/malpractice', {
        registration_id: parseInt(String(registration_id), 10),
        description,
        action_taken,
        status,
        reported_by: reported_by || user.name
      });
      setShowForm(false);
      fetchRecords();
    } catch (err) {
      alert('Failed to report incident');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-3 italic tracking-tighter">Malpractice Terminal</h1>
          <p className="text-gray-500 font-medium italic">Disciplinary oversight and incident management.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-8 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
        >
          <Plus size={18} /> Report Incident
        </button>
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-cems-bg/80 backdrop-blur-xl"
          >
            <div className="max-w-2xl w-full glass-card p-10 rounded-[3rem] border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white italic">New Incident Report</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">Close</button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Reg ID</label>
                  <input type="text" required className="w-full bg-cems-bg/50 border border-white/10 rounded-xl px-4 py-3 text-white" 
                    onChange={(e) => setFormData({...formData, registration_id: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Roll No</label>
                  <input type="text" required className="w-full bg-cems-bg/50 border border-white/10 rounded-xl px-4 py-3 text-white" 
                    onChange={(e) => setFormData({...formData, roll_no: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Student name (info only)</label>
                  <input type="text" className="w-full bg-cems-bg/30 border border-white/10 rounded-xl px-4 py-3 text-gray-400" 
                    onChange={(e) => setFormData({...formData, student_name: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Subject (info only)</label>
                  <input type="text" className="w-full bg-cems-bg/30 border border-white/10 rounded-xl px-4 py-3 text-gray-400" 
                    onChange={(e) => setFormData({...formData, subject_name: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea required className="w-full bg-cems-bg/50 border border-white/10 rounded-xl px-4 py-3 text-white h-32" 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="col-span-2 pt-4">
                  <button type="submit" className="w-full py-4 bg-red-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px]">Submit Evidence</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-cems-card rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/2 border-b border-white/5">
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Student</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Subject</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Action</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.malpractice_id} className="border-b border-white/5 hover:bg-white/2 transition-all group">
                <td className="px-8 py-6">
                  <div className="font-bold text-white">{record.student_name}</div>
                  <div className="text-[10px] text-cems-blue font-mono font-bold">{record.roll_no}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm font-medium text-gray-400">{record.subject_name}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-xs text-red-400 font-bold italic">{record.action_taken}</div>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyMalpractice;
