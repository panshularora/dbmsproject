import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  FileBarChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchEvals();
  }, [user.id]);

  const pending = evaluations.filter(e => e.status !== 'Graded').length;
  const graded = evaluations.filter(e => e.status === 'Graded').length;
  const gradedMarks = evaluations.filter(e => e.marks != null && e.marks !== '');
  const avgScore = gradedMarks.length
    ? (gradedMarks.reduce((sum, e) => sum + Number(e.marks), 0) / gradedMarks.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black text-white mb-2 italic">Faculty Command Center</h1>
        <p className="text-gray-500 font-medium">Hello {user.name}, you have {pending} pending evaluations this week.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Welcome Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-cems-blue to-indigo-700 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-6 italic">Simplify your <br /> grading workflow.</h2>
            <div className="flex gap-12">
              <div className="text-center">
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Total Assigned</p>
                <p className="text-4xl font-black text-white italic">{evaluations.length}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Success Rate</p>
                <p className="text-4xl font-black text-white italic">94%</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/faculty/evaluations')}
              className="mt-10 px-8 py-4 bg-white text-cems-blue font-black rounded-2xl hover:bg-gray-100 transition-all flex items-center gap-3 group text-xs uppercase tracking-widest"
            >
              Start Grading Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="absolute top-[-20%] right-[-10%] opacity-10">
            <TrendingUp size={300} />
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-4">
          <div className="bg-cems-card rounded-3xl p-6 border border-gray-800 flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
              <Clock size={32} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Pending</p>
              <h4 className="text-3xl font-black text-white italic">{pending}</h4>
            </div>
          </div>
          <div className="bg-cems-card rounded-3xl p-6 border border-gray-800 flex items-center gap-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Graded</p>
              <h4 className="text-3xl font-black text-white italic">{graded}</h4>
            </div>
          </div>
          <div className="bg-cems-card rounded-3xl p-6 border border-gray-800 flex items-center gap-6">
            <div className="w-16 h-16 bg-cems-purple/10 rounded-2xl flex items-center justify-center text-cems-purple">
              <FileBarChart size={32} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Avg Score</p>
              <h4 className="text-3xl font-black text-white italic">{avgScore}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-cems-card rounded-[2.5rem] p-8 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <Clock className="text-gray-500" /> Recent Activity
          </h3>
          <div className="space-y-6">
            {evaluations.slice(0, 4).map((item, i) => (
              <div key={i} className="flex gap-4 items-start pb-6 border-b border-gray-800/50 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} className={item.status === 'Graded' ? 'text-green-500' : 'text-gray-600'} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white mb-1">Graded {item.student_name}</h5>
                  <p className="text-xs text-gray-500 italic">{item.subject_name}</p>
                </div>
                <div className="ml-auto text-[10px] text-gray-700 font-mono">2h ago</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-cems-card rounded-[2.5rem] p-8 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-8">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/faculty/students')}
              className="p-6 bg-cems-bg rounded-2xl border border-gray-800 hover:border-cems-blue transition-all group text-left"
            >
              <Users className="text-cems-blue mb-4 group-hover:scale-110 transition-transform" size={24} />
              <h5 className="text-white font-bold text-sm">Student List</h5>
              <p className="text-[10px] text-gray-600 uppercase mt-1 tracking-widest font-black">Directory</p>
            </button>
            <button className="p-6 bg-cems-bg rounded-2xl border border-gray-800 hover:border-cems-purple transition-all group text-left">
              <PlusCircle className="text-cems-purple mb-4 group-hover:scale-110 transition-transform" size={24} />
              <h5 className="text-white font-bold text-sm">Generate Report</h5>
              <p className="text-[10px] text-gray-600 uppercase mt-1 tracking-widest font-black">Analytics</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
