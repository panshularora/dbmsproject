import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Info, AlertTriangle, FileText } from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/notifications/${user.id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-white transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-cems-bg">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-[1000] overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-gray-800/50">
              <span className="font-bold text-white">Notifications</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                {unreadCount} New
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.notification_id}
                    onClick={() => markAsRead(n.notification_id)}
                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex gap-4 ${!n.is_read ? 'bg-blue-500/5' : ''}`}
                  >
                    <div className={`p-2 rounded-lg h-fit ${
                      n.type === 'malpractice' ? 'bg-red-500/20 text-red-400' : 
                      n.type === 'result' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {n.type === 'malpractice' ? <AlertTriangle size={16} /> : 
                       n.type === 'result' ? <Check size={16} /> : <Info size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-white truncate">{n.title}</span>
                        {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">{n.message}</p>
                      <span className="text-[9px] text-gray-600 mt-2 block italic">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
