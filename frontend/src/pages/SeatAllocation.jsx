import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, User, CheckCircle2, Navigation, Info, Shield } from 'lucide-react';

const SeatAllocation = () => {
  const { user } = useAuth();
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeat = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/students/${user.id}/seat`);
        setAllocation(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchSeat();
  }, [user.id]);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-cems-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-black text-white mb-3 italic tracking-tighter">Strategic Seat Matrix</h1>
          <p className="text-gray-500 font-medium italic">High-fidelity spatial allocation for Hall: <span className="text-cems-blue font-bold">{allocation?.hall_name || 'N/A'}</span></p>
        </div>
        <div className="p-4 glass-card rounded-2xl border border-white/5 flex items-center gap-3">
          <Shield className="text-green-500" size={20} />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Zone</span>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Visual Grid with 3D-ish Perspective */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="xl:col-span-2 glass-card rounded-[3.5rem] p-12 border border-white/5 shadow-2xl overflow-hidden relative group"
        >
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="flex flex-col items-center relative z-10">
            {/* Front of Hall / Stage */}
            <div className="w-full mb-16 flex flex-col items-center">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '66%' }}
                className="h-2 bg-gradient-to-r from-transparent via-cems-blue to-transparent rounded-full mb-6"
              />
              <div className="px-10 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-500 font-black text-[10px] uppercase tracking-[0.8em] mb-4 backdrop-blur-md">
                Front / Invigilator Console
              </div>
            </div>

            {/* Seat Grid with Staggered Animation */}
            <div className="grid grid-cols-11 gap-4 mb-16 select-none p-4 bg-cems-bg/30 rounded-[2rem] border border-white/5 shadow-inner">
              <div className="w-12 h-12"></div>
              {cols.map(c => <div key={c} className="w-12 h-12 flex items-center justify-center text-[10px] font-black text-gray-700 tracking-tighter">{c}</div>)}
              
              {rows.map((r, ri) => (
                <React.Fragment key={r}>
                  <div className="w-12 h-12 flex items-center justify-center text-[10px] font-black text-gray-700">{r}</div>
                  {cols.map((c, ci) => {
                    const seatId = `${r}${c}`;
                    const isMySeat = allocation?.seat_no === seatId;
                    return (
                      <motion.div 
                        key={seatId}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.001 * (ri * 10 + ci) }}
                        whileHover={{ scale: 1.15, zIndex: 20 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-help relative group/seat ${
                          isMySeat 
                            ? 'bg-gradient-to-br from-cems-blue to-indigo-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.6)] z-10 animate-float' 
                            : 'bg-white/5 text-gray-700 hover:bg-white/10 hover:text-gray-400'
                        }`}
                      >
                        {isMySeat ? <User size={20} className="drop-shadow-lg" /> : <div className="w-1.5 h-1.5 bg-current rounded-full opacity-20"></div>}
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-[10px] font-bold text-white rounded-lg opacity-0 group-hover/seat:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                          Seat {seatId}
                        </div>
                      </motion.div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Premium Legend */}
            <div className="flex gap-12 px-10 py-5 glass-card rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <div className="w-4 h-4 bg-white/5 rounded-md border border-white/10"></div> Vacant
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <div className="w-4 h-4 bg-gray-800 rounded-md"></div> Occupied
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-cems-blue uppercase tracking-widest">
                <div className="w-4 h-4 bg-cems-blue rounded-md shadow-lg shadow-blue-500/40"></div> Assigned
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Column */}
        <div className="space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-600 via-cems-blue to-cyan-500 rounded-[3.5rem] p-10 shadow-2xl shadow-blue-500/30 relative overflow-hidden group"
          >
            <div className="relative z-10">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Access Token</p>
              {allocation ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                      className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/20 shadow-2xl"
                    >
                      <span className="text-5xl font-black text-white italic drop-shadow-lg">{allocation.seat_no}</span>
                    </motion.div>
                    <div>
                      <h4 className="text-3xl font-black text-white italic tracking-tighter leading-none mb-2">{allocation.hall_name.split('?"')[0].trim()}</h4>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{allocation.hall_name.split('?"')[1]?.trim() || 'Level 2 Sector A'}</p>
                    </div>
                  </div>
                  
                  <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-[9px] font-black text-white/40 uppercase mb-1">Check-in</p>
                      <p className="text-sm font-bold text-white">09:15 AM</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-[9px] font-black text-white/40 uppercase mb-1">Block</p>
                      <p className="text-sm font-bold text-white">Tech Park</p>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 bg-white text-cems-blue font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-white/10"
                  >
                    View Directions
                  </motion.button>
                </div>
              ) : (
                <div className="py-20 text-center text-white/40 italic font-medium">Scanning for allocation...</div>
              )}
            </div>
            
            {/* Background Icon */}
            <Navigation className="absolute -right-12 -bottom-12 text-white/5 group-hover:scale-125 transition-transform duration-700" size={240} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-[3.5rem] p-10 border border-white/5"
          >
            <h4 className="text-white font-black text-lg mb-8 flex items-center gap-3 italic">
              <Info className="text-cems-blue" size={20} /> Hall Protocol
            </h4>
            <div className="space-y-6">
              {[
                { text: 'Digital ID verification required at entry', icon: <CheckCircle2 size={16} className="text-green-500" /> },
                { text: 'No biometric unauthorized devices permitted', icon: <CheckCircle2 size={16} className="text-green-500" /> },
                { text: 'Stationary check mandatory by 09:45 AM', icon: <CheckCircle2 size={16} className="text-green-500" /> },
                { text: 'Emergency exits are marked in neon blue', icon: <CheckCircle2 size={16} className="text-green-500" /> }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex gap-4 items-start group"
                >
                  <div className="mt-0.5 group-hover:scale-125 transition-transform">{item.icon}</div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SeatAllocation;
