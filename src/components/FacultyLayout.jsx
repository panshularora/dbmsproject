import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Edit3,
  LogOut,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

const FacultyLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/faculty/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Evaluations', path: '/faculty/evaluations', icon: <Edit3 size={20} /> },
    { name: 'Students', path: '/faculty/students', icon: <Users size={20} /> },
    { name: 'Malpractice', path: '/faculty/malpractice', icon: <ShieldAlert size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-cems-bg text-gray-300">
      {/* Sidebar */}
      <aside className="w-64 bg-cems-sidebar border-r border-gray-800 flex flex-col fixed inset-y-0">
        <div className="p-8 flex items-center gap-3">
          <div className="p-2 bg-cems-blue rounded-lg">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter">SRM <span className="text-[10px] text-gray-600 block leading-none font-bold uppercase">Faculty</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 px-4">Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-cems-blue text-white shadow-lg shadow-blue-500/20' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }`
              }
            >
              {item.icon}
              <span className="font-bold text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/30 rounded-xl mb-4">
            <div className="w-8 h-8 bg-cems-purple rounded-full flex items-center justify-center font-bold text-white text-xs">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default FacultyLayout;
