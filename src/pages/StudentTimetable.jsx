import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Clock, MapPin, Calendar, CheckCircle, Timer, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StudentTimetable = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get(`/timetable/${user.id}`);
        // Use real values from API
        const formatted = res.data.map((row, i) => ({
          ...row,
          timetable_id: i
        }));
        setTimetable(formatted);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [user.id]);

  const handleDownloadPDF = () => {
    if (timetable.length === 0) { alert('No timetable to download. Please register for subjects first.'); return; }
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('SRM Institute of Science and Technology', 14, 22);
    doc.setFontSize(14);
    doc.text('Examination Timetable', 14, 32);
    
    doc.setFontSize(11);
    doc.text(`Student: ${user?.name}`, 14, 45);
    doc.text(`Semester: ${user?.semester || 1}`, 14, 52);

    const tableData = timetable.map((row, i) => [
      String(i + 1).padStart(2, '0'),
      row.subject_name,
      new Date(row.exam_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      row.exam_time
    ]);

    doc.autoTable({
      startY: 60,
      head: [['#', 'Subject', 'Date', 'Time']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] }
    });

    doc.save(`SRM_Timetable_${user?.id}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Examination Timetable</h1>
          <p className="text-gray-500 font-medium italic">Your personalized exam schedule for Semester {user?.semester || 1}. Click on a subject to see seat allocation.</p>
        </div>
        <button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-all"
        >
          <Download size={18} /> Download Schedule
        </button>
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
                <tr 
                  key={row.timetable_id} 
                  onClick={() => navigate(`/student/seat?subjectId=${row.subject_id}`)}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors group cursor-pointer"
                >
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
