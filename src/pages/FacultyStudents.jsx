import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, GraduationCap, Phone, Mail, Book } from 'lucide-react';

const FacultyStudents = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, semester]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/students?search=${search}&semester=${semester}`);
      setStudents(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Student Directory</h1>
          <p className="text-gray-500 font-medium italic">Manage and view all students enrolled in current cycles.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="bg-cems-card border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input 
              type="text" 
              placeholder="Search roll no, name..." 
              className="w-full bg-cems-card border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cems-blue transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {students.map((student) => (
          <div key={student.student_id} className="bg-cems-card rounded-[2rem] p-8 border border-gray-800 hover:border-cems-blue transition-all group shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-cems-blue group-hover:bg-cems-blue group-hover:text-white transition-all duration-500">
                <GraduationCap size={32} />
              </div>
              <span className="px-3 py-1 bg-gray-800 text-[10px] font-black text-gray-500 rounded-full uppercase tracking-widest">Sem {student.semester}</span>
            </div>
            
            <h4 className="text-xl font-bold text-white mb-1">{student.first_name} {student.last_name}</h4>
            <p className="text-xs text-cems-blue font-bold font-mono uppercase mb-6 tracking-widest">{student.roll_no}</p>

            <div className="space-y-3 pt-6 border-t border-gray-800/50">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Book size={14} className="text-gray-700" />
                <span>{student.course}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Mail size={14} className="text-gray-700" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Phone size={14} className="text-gray-700" />
                <span>{student.phone_no}</span>
              </div>
            </div>
            
            <button className="mt-8 w-full py-3 bg-gray-800/50 text-gray-400 font-bold rounded-xl text-xs hover:bg-cems-blue hover:text-white transition-all uppercase tracking-widest">
              View Profile
            </button>
          </div>
        ))}
      </div>

      {students.length === 0 && !loading && (
        <div className="text-center py-20 bg-cems-card rounded-[2rem] border border-gray-800 border-dashed">
          <p className="text-gray-600 font-medium italic">No students found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default FacultyStudents;
