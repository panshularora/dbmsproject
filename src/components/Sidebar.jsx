import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Students', path: '/students', icon: <Users size={20} /> },
    { name: 'Results', path: '/results', icon: <FileText size={20} /> },
    { name: 'Timetable', path: '/timetable', icon: <Calendar size={20} /> },
    { name: 'Hall Allocations', path: '/hall-allocations', icon: <MapPin size={20} /> },
    { name: 'Malpractice', path: '/malpractice', icon: <AlertTriangle size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-navy-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3 border-b border-navy-800">
        <GraduationCap className="text-blue-400" size={32} />
        <h1 className="text-xl font-bold tracking-tight">SRM Exam Portal</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-navy-800 text-xs text-gray-500 text-center">
        © 2026 SRM Exam Portal
      </div>
    </div>
  );
};

export default Sidebar;
