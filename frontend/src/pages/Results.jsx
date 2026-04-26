import React, { useState } from 'react';
import axios from 'axios';
import { Search, Printer, FileText, Download } from 'lucide-react';

const Results = () => {
  const [studentId, setStudentId] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGradesheet = async (e) => {
    if (e) e.preventDefault();
    if (!studentId) return;

    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5000/api/results/gradesheet/${studentId}`);
      setResults(res.data);
      setLoading(false);
    } catch (err) {
      setError('Student not found or result not available.');
      setResults(null);
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'O': return 'bg-green-100 text-green-700 border-green-200';
      case 'A+': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'A': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'B+': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'F': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Result Center</h1>
        <p className="text-gray-500">Search and generate student marksheet</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={fetchGradesheet} className="flex gap-4 max-w-xl">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Enter Student ID (e.g., 1)..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Fetch Result
          </button>
        </form>
      </div>

      {loading && <div className="p-12 text-center text-gray-500">Generating report...</div>}
      
      {error && (
        <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
          <FileText size={20} />
          {error}
        </div>
      )}

      {results && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="bg-navy-900 p-8 text-white flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">{results.student.name}</h2>
              <p className="text-blue-300 font-mono tracking-wider">{results.student.roll_no}</p>
              <div className="mt-4 flex gap-6 text-sm text-gray-300">
                <div><span className="block text-gray-500 uppercase text-[10px] font-bold">Course</span>{results.student.course}</div>
                <div><span className="block text-gray-500 uppercase text-[10px] font-bold">Semester</span>{results.student.semester}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Academic Year</div>
              <div className="text-xl font-bold">2024-25</div>
              <button className="mt-4 px-4 py-2 bg-navy-800 border border-navy-700 rounded-lg hover:bg-navy-700 transition-colors flex items-center gap-2 text-sm">
                <Printer size={16} /> Print Marksheet
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Subject Code</th>
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Subject Name</th>
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider text-center">Credits</th>
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider text-center">Marks</th>
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-wider text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.results.map((res, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-mono text-sm text-blue-600">{res.subject_code}</td>
                    <td className="py-4 font-medium text-gray-900">{res.subject_name}</td>
                    <td className="py-4 text-center text-gray-600">{res.credits}</td>
                    <td className="py-4 text-center font-bold">{res.marks}</td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${getGradeColor(res.grade)}`}>
                        {res.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary Footer */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
              <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                <span className="text-gray-500 font-medium">Total Subjects:</span>
                <span className="text-right font-bold text-gray-900">{results.summary.total_subjects}</span>
                <span className="text-gray-500 font-medium">Average Marks:</span>
                <span className="text-right font-bold text-blue-600 text-lg">{results.summary.average_marks}%</span>
                <span className="text-gray-500 font-medium pt-2">Overall Result:</span>
                <span className="text-right font-black text-green-600 text-lg pt-2">PASS</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
