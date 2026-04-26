import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, UserCheck, ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password, role);
      // Simulate a small delay for smoother transition
      setTimeout(() => {
        if (user.role === 'student') navigate('/student/dashboard');
        else navigate('/faculty/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-cems-bg relative overflow-hidden">
      <div className="mesh-bg"></div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-cems-purple/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-cems-blue/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Left Side: Dynamic Branding */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-12 relative">
        <div className="max-w-xl w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="p-4 bg-gradient-to-br from-cems-purple to-indigo-600 rounded-[1.5rem] shadow-2xl shadow-purple-500/30 rotate-3">
              <GraduationCap className="text-white" size={48} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-5xl font-black text-white tracking-tighter italic leading-none">SRM</h1>
              <span className="text-[10px] font-black text-cems-purple uppercase tracking-[0.5em] mt-1 ml-1">Portal v2.0</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-6xl font-black text-white mb-8 leading-[0.95] italic tracking-tighter">
              Next-Gen <br /> <span className="text-cems-purple">Examination</span> <br /> Management.
            </h2>
            <p className="text-xl text-gray-500 font-medium mb-12 max-w-md leading-relaxed">
              Experience the pinnacle of academic administration. Secure, intuitive, and blisteringly fast.
            </p>
          </motion.div>

          {/* Interactive Feature Cards Overlay */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: <UserCheck />, label: 'Verified Auth', color: 'bg-blue-500' },
              { icon: <ShieldCheck />, label: 'Encrypted Data', color: 'bg-purple-500' }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 rounded-[2rem] border border-white/5 flex flex-col items-center gap-4 text-center group"
              >
                <div className={`p-4 ${f.color}/10 rounded-2xl text-white group-hover:scale-110 transition-transform duration-500`}>
                  {f.icon}
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Glassmorphism Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-12 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden"
        >
          {/* Form Glow Effect */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cems-purple opacity-10 blur-[80px]"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cems-blue opacity-10 blur-[80px]"></div>

          <div className="text-center mb-10 relative">
            <h3 className="text-3xl font-black text-white italic mb-3 tracking-tighter">Access Terminal</h3>
            <p className="text-gray-500 text-sm font-medium">Enter your credentials to proceed</p>
          </div>

          {/* Enhanced Role Toggle */}
          <div className="flex p-1.5 bg-cems-bg/50 rounded-2xl mb-10 border border-white/5 relative">
            <motion.div 
              animate={{ x: role === 'student' ? 0 : '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-cems-card rounded-xl shadow-xl border border-white/5"
            />
            <button
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative z-10 ${
                role === 'student' ? 'text-white' : 'text-gray-500'
              }`}
            >
              <UserCheck size={18} /> Student
            </button>
            <button
              onClick={() => setRole('faculty')}
              className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative z-10 ${
                role === 'faculty' ? 'text-white' : 'text-gray-500'
              }`}
            >
              <ShieldCheck size={18} /> Faculty
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-cems-purple transition-colors">Identity Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full bg-cems-bg/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cems-purple/50 focus:border-transparent transition-all placeholder:text-gray-700"
                  placeholder="name@srm.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-cems-purple transition-colors">Security Key</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full bg-cems-bg/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cems-purple/50 focus:border-transparent transition-all placeholder:text-gray-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-cems-purple to-indigo-600 text-white font-black rounded-2xl hover:shadow-[0_10px_30px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-[10px]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Authorize Access <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <div className="mt-12 flex items-center justify-center gap-2 text-xs font-medium text-gray-600">
            <span className="w-8 h-px bg-gray-800"></span>
            <span>Secured Session Terminal</span>
            <span className="w-8 h-px bg-gray-800"></span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
