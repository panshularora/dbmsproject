import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ChevronRight, 
  FileText, 
  Bell, 
  MapPin, 
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/students/${user.id}/dashboard`);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-cems-purple border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Hero + Timeline */}
        <div className="lg:col-span-2 space-y-10">
          {/* Hero Card with Dynamic Glow */}
          <motion.div 
            variants={item}
            className="group relative bg-gradient-to-br from-indigo-600 via-cems-purple to-pink-500 rounded-[3rem] p-12 overflow-hidden shadow-2xl shadow-purple-500/30"
          >
            <div className="relative z-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-8 border border-white/20 backdrop-blur-md"
              >
                <TrendingUp size={14} /> Academic Status: Active
              </motion.div>
              <h2 className="text-5xl font-black text-white mb-6 italic leading-none tracking-tighter">
                Ready for <br /> Finals, {user.name.split(' ')[0]}?
              </h2>
              <div className="flex gap-12">
                <div className="group/stat cursor-default">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Registered</p>
                  <p className="text-4xl font-black text-white transition-transform group-hover/stat:scale-110 duration-300">{data?.registeredSubjects || 0}</p>
                  <p className="text-[10px] text-white/40 mt-1 font-bold">Subjects this sem</p>
                </div>
                <div className="w-px h-16 bg-white/10"></div>
                <div className="group/stat cursor-default">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Evaluated</p>
                  <p className="text-4xl font-black text-white transition-transform group-hover/stat:scale-110 duration-300">{data?.completedExams || 0}</p>
                  <p className="text-[10px] text-white/40 mt-1 font-bold">Grades published</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/student/timetable')}
                className="mt-12 px-8 py-4 bg-white text-cems-purple font-black rounded-2xl hover:shadow-2xl transition-all flex items-center gap-3 group text-xs uppercase tracking-widest"
              >
                Launch Timetable <ChevronRight size={18} />
              </motion.button>
            </div>
            
            {/* Animated Background Blobs */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                x: [0, 50, 0]
              }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px]"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                y: [0, -50, 0]
              }}
              transition={{ duration: 15, repeat: Infinity }}
              className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px]"
            />
          </motion.div>

          {/* Timeline Section */}
          <motion.div variants={item} className="glass-card rounded-[3rem] p-10 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter">Command Center</h2>
              <p className="text-gray-500 font-medium">Mission control for your academic journey</p>
            </div>
            
            {/* Demo Controls */}
            <div className="flex gap-4 p-2 bg-cems-card/50 rounded-2xl border border-white/5">
              <button 
                onClick={async () => {
                  if (window.confirm('Reset all your demo data (registrations, seats, results)?')) {
                    await api.post(`/demo/reset/${user.id}`);
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all"
              >
                Reset Demo
              </button>
              <button 
                onClick={async () => {
                  await api.post(`/demo/evaluate/${user.id}`);
                  alert('Results generated for registered subjects!');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-cems-purple/10 text-cems-purple text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cems-purple/20 transition-all"
              >
                Mock Results
              </button>
            </div>
          </div>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-white italic flex items-center gap-4">
                <div className="p-3 bg-cems-blue/10 rounded-2xl text-cems-blue">
                  <Clock size={24} />
                </div>
                Schedule Timeline
              </h3>
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-cems-blue rounded-full"></span>
                <span className="w-2 h-2 bg-gray-800 rounded-full"></span>
              </div>
            </div>
            
            <div className="space-y-6 relative before:absolute before:left-[2.75rem] before:top-4 before:bottom-4 before:w-1 before:bg-gradient-to-b before:from-cems-blue before:via-cems-purple before:to-transparent">
              {[
                { subject: 'Database Management Systems', date: 'May 12, 2025', time: '10:00 AM', status: 'Core', color: 'blue' },
                { subject: 'Theory of Computation', date: 'May 15, 2025', time: '02:00 PM', status: 'Major', color: 'purple' },
                { subject: 'Web Technologies', date: 'May 18, 2025', time: '10:00 AM', status: 'Elective', color: 'pink' },
              ].map((exam, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 10 }}
                  className="flex items-center gap-10 group cursor-pointer"
                >
                  <div className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center shrink-0 z-10 border-8 border-cems-bg transition-all duration-500 bg-cems-card group-hover:scale-110 shadow-xl`}>
                    <span className="text-[10px] font-black text-gray-500 uppercase">{exam.date.split(' ')[0]}</span>
                    <span className="text-3xl font-black text-white italic leading-none">{exam.date.split(' ')[1].replace(',', '')}</span>
                  </div>
                  <div className="bg-white/2 p-8 rounded-[2.5rem] border border-white/5 flex-1 transition-all duration-500 hover:bg-white/5 hover:border-white/20">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-bold text-white group-hover:text-cems-blue transition-colors">{exam.subject}</h4>
                      <span className={`px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10`}>{exam.status}</span>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={14} className="text-cems-blue" /> {exam.date}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} className="text-cems-purple" /> {exam.time}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-10">
          {/* Result Card - 3D Effect */}
          <motion.div 
            variants={item}
            whileHover={{ y: -10 }}
            className="glass-card rounded-[3rem] p-10 border border-white/5 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-8">
              <div className="w-12 h-12 bg-cems-purple/20 rounded-2xl flex items-center justify-center text-cems-purple">
                <FileText size={24} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-8">Latest Result</h3>
            {data?.latestResult ? (
              <div className="text-center relative">
                <motion.div 
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="inline-block relative mb-8"
                >
                  <div className="absolute inset-0 bg-cems-purple blur-3xl opacity-20 animate-pulse"></div>
                  <div className="w-28 h-28 bg-gradient-to-br from-cems-purple to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl relative z-10 border border-white/20">
                    <span className="text-5xl font-black text-white italic drop-shadow-lg">{data.latestResult.grade}</span>
                  </div>
                </motion.div>
                <h4 className="text-lg font-black text-white mb-2">{data.latestResult.subject_name}</h4>
                <div className="flex items-center justify-center gap-2 text-cems-blue font-bold text-sm mb-8">
                  <TrendingUp size={16} /> Score: {data.latestResult.marks}/100
                </div>
                <button 
                  onClick={() => navigate('/student/results')}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] transition-all border border-white/5"
                >
                  Download Marksheet
                </button>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-600 italic">No published results.</div>
            )}
          </motion.div>

          {/* Seat Action Card */}
          <motion.button 
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/student/seat')}
            className="w-full relative h-72 rounded-[3rem] overflow-hidden group shadow-2xl shadow-blue-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cems-blue to-indigo-900 z-0"></div>
            <div className="relative z-10 p-10 text-left flex flex-col h-full">
              <div className="p-4 bg-white/10 rounded-2xl w-fit mb-auto backdrop-blur-md border border-white/20">
                <MapPin className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-black text-white italic mb-2 tracking-tighter">Locate Your <br /> Exam Seat</h3>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                Hall Matrix V2.0 <ChevronRight size={14} />
              </p>
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute right-[-20%] bottom-[-10%] text-white/5 pointer-events-none"
            >
              <MapPin size={280} />
            </motion.div>
          </motion.button>

          {/* Notices */}
          <motion.div variants={item} className="glass-card rounded-[3rem] p-10 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <Bell className="text-orange-500" /> Notifications
            </h3>
            <div className="space-y-4">
              {data?.notices.map((notice, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="p-5 bg-white/2 rounded-2xl border border-white/5 hover:border-cems-blue/30 transition-all cursor-pointer group"
                >
                  <h5 className="text-sm font-bold text-white mb-1 group-hover:text-cems-blue transition-colors">{notice.title}</h5>
                  <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{notice.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
