import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Clock, MapPin, Calendar, CheckCircle, Timer } from 'lucide-react';

const StudentTimetable = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/students/${user.id}/timetable`);
        setTimetable(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [user.id]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-white mb-2">Examination Timetable</h1>
        <p className="text-gray-500 font-medium italic">Your personalized exam schedule for Semester {user?.semester || 1}.</p>
      </header>

      <div className="bg-cems-card rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/20">
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Subject Details</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Type</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Date & Time</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Venue</th>
                <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map((row) => (
                <tr key={row.timetable_id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-white group-hover:text-cems-blue transition-colors">{row.subject_name}</div>
                    <div className="text-[10px] text-gray-600 mt-1 font-mono tracking-tighter">SUB-ID: {row.subject_id}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      row.type === 'Core' ? 'bg-cems-purple/10 text-cems-purple border border-cems-purple/20' :
                      row.type === 'Elective' ? 'bg-cems-blue/10 text-cems-blue border border-cems-blue/20' :
                      'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar size={14} className="text-gray-600" /> {row.exam_date}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Clock size={12} className="text-gray-700" /> {row.exam_time}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin size={14} className="text-cems-blue" /> {row.venue}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${
                      row.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-cems-blue/10 text-cems-blue'
                    }`}>
                      {row.status === 'Completed' ? <CheckCircle size={14} /> : <Timer size={14} />}
                      {row.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {timetable.length === 0 && (
          <div className="p-20 text-center text-gray-600 italic">No exams scheduled for this semester yet.</div>
        )}
      </div>
    </div>
  );
};

export default StudentTimetable;
