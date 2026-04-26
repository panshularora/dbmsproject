import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, Search } from 'lucide-react';

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [semester, setSemester] = useState('1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/timetable?semester=${semester}`);
        setTimetable(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching timetable", err);
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [semester]);

  const currentData = timetable;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examination Schedule</h1>
          <p className="text-gray-500">Academic Year 2024-25 | Cycle Test 1</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map(s => (
            <button
              key={s}
              onClick={() => setSemester(s.toString())}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                semester === s.toString() 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              Sem {s}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading schedule...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentData.map((item) => (
            <div key={item.timetable_id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Calendar size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 font-mono">#{item.timetable_id}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-1">{item.subject_name}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="font-medium">{item.exam_date}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span className="font-medium">{item.exam_time}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="font-medium">Main Examination Hall</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Status</span>
                <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold uppercase">Confirmed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timetable;
