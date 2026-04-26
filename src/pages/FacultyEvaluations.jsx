import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Edit3, X, Check } from 'lucide-react';

const FacultyEvaluations = () => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [marks, setMarks] = useState('');

  useEffect(() => {
    fetchEvals();
  }, [user.id]);

  const fetchEvals = async () => {
    try {
      const res = await api.get(`/faculty/${user.id}/evaluations`);
      setEvaluations(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/evaluations/${id}`, { marks: parseFloat(marks) });
      setEditing(null);
      fetchEvals();
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Evaluations</h1>
          <p className="text-gray-500 font-medium italic">Grading portal for assigned subjects.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="bg-cems-card border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cems-blue transition-all"
            />
          </div>
        </div>
      </header>

      <div className="bg-cems-card rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-800/20 border-b border-gray-800">
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Student Info</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Subject</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Marks</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((item) => (
                <tr key={item.evaluation_id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-all">
                  <td className="px-8 py-6">
                    <div className="font-bold text-white">{item.student_name}</div>
                    <div className="text-[10px] text-gray-600 uppercase font-black">Reg-ID: {item.registration_id}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-gray-400">{item.subject_name}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      item.status === 'Graded' 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                        : 'bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {editing === item.evaluation_id ? (
                      <input 
                        type="number" 
                        className="w-16 bg-cems-bg border border-cems-blue rounded px-2 py-1 text-white text-center font-black focus:outline-none"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <div className="text-lg font-black text-white italic">{item.marks || '-'}</div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {editing === item.evaluation_id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditing(null)} className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white"><X size={16} /></button>
                        <button onClick={() => handleUpdate(item.evaluation_id)} className="p-2 bg-cems-blue rounded-lg text-white hover:bg-blue-600"><Check size={16} /></button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditing(item.evaluation_id); setMarks(item.marks || ''); }}
                        className="p-3 bg-gray-800/50 text-gray-500 hover:text-cems-blue hover:bg-cems-blue/10 rounded-xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyEvaluations;
