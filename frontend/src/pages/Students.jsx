import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/students?limit=50`;
      if (semester) url += `&semester=${semester}`;
      if (course) url += `&course=${encodeURIComponent(course)}`;
      
      const res = await axios.get(url);
      let data = res.data;
      
      if (searchTerm) {
        data = data.filter(s => 
          s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setStudents(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching students", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [semester, course]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-gray-500">Manage and view student information</p>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <form onSubmit={handleSearch} className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="flex gap-4">
          <select 
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>

          <select 
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            <option value="B.Tech CSE">B.Tech CSE</option>
            <option value="B.Tech ECE">B.Tech ECE</option>
            <option value="B.Tech IT">B.Tech IT</option>
          </select>

          <button 
            onClick={fetchStudents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Filter size={18} />
            Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading student data...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-semibold">
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4 text-center">Semester</th>
                <th className="px-6 py-4">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student) => (
                <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-blue-600 font-medium">{student.roll_no}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.first_name} {student.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.course}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                      Sem {student.semester}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.phone_no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Mockup */}
      <div className="flex justify-between items-center text-sm text-gray-500 px-2">
        <span>Showing {students.length} students</span>
        <div className="flex gap-2">
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
          <button className="p-2 border border-gray-200 rounded hover:bg-gray-50"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default Students;
