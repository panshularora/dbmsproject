import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookMarked, 
  CalendarDays, 
  MapPin, 
  FileCheck, 
  LogOut,
  GraduationCap,
  Bell,
  Search,
  ShieldAlert
} from 'lucide-react';

const StudentLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Registration', path: '/student/registration', icon: <BookMarked size={20} /> },
    { name: 'Timetable', path: '/student/timetable', icon: <CalendarDays size={20} /> },
    { name: 'Seat Allocation', path: '/student/seat', icon: <MapPin size={20} /> },
    { name: 'Results', path: '/student/results', icon: <FileCheck size={20} /> },
    { name: 'Malpractice', path: '/student/malpractice', icon: <ShieldAlert size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-cems-bg text-gray-300 relative overflow-hidden">
      <div className="mesh-bg"></div>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="w-64 glass-sidebar border-r border-white/5 flex flex-col fixed inset-y-0 z-50 shadow-2xl"
      >
        <div className="p-8 flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="p-2 bg-gradient-to-br from-cems-purple to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20"
          >
            <GraduationCap className="text-white" size={24} />
          </motion.div>
          <span className="text-2xl font-black text-white tracking-tighter italic">SRM</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 px-4">Navigation</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-cems-purple/20 to-transparent text-white border-l-4 border-cems-purple' 
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              <span className="transition-transform group-hover:scale-110 duration-300">{item.icon}</span>
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-white/2">
          <div className="flex items-center gap-3 px-4 py-4 bg-cems-card rounded-2xl border border-white/5 mb-4 group cursor-pointer hover:border-cems-blue transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-cems-blue to-cyan-500 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate font-mono uppercase tracking-tighter">{user?.roll_no}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-black text-xs uppercase tracking-widest"
          >
            <LogOut size={18} /> Logout
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen">
        {/* Top Navbar */}
        <header className="h-20 glass-sidebar border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
            <input 
              type="text" 
              placeholder="Search features, exams..." 
              className="w-full bg-cems-bg/50 border border-white/5 rounded-2xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cems-purple/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Server Live</span>
            </div>
            <button className="p-2.5 bg-cems-card border border-white/5 rounded-xl text-gray-400 hover:text-white transition-all relative group">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-cems-card"></span>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="p-10 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
