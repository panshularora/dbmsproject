import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Download, Award, FileText, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StudentResults = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/results/${user.id}`);
        // Now fetching real computed grades and GPA from the database
        const formattedResults = res.data.map((r, i) => ({
          ...r,
          evaluation_id: i, // Fallback if no ID is returned
        }));
        setResults(formattedResults);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchResults();
  }, [user.id]);

  // GPA: prefer from API result (vw_student_results), then from user context (set at login), else 0.00
  const gpa = (results.length > 0 && results[0].gpa)
    ? Number(results[0].gpa).toFixed(2)
    : (user?.gpa ? Number(user.gpa).toFixed(2) : '0.00');

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('SRM Institute of Science and Technology', 14, 22);
    doc.setFontSize(14);
    doc.text('Official Grade Sheet', 14, 32);
    
    doc.setFontSize(12);
    doc.text(`Student ID: ${user?.id}`, 14, 45);
    doc.text(`Semester: ${user?.semester || 1}`, 14, 52);
    doc.text(`Current GPA: ${gpa}`, 14, 59);

    const tableData = results.map(r => [
      r.subject_code || `SUB-${r.subject_id}`,
      r.subject_name,
      r.credits,
      r.marks,
      r.grade
    ]);

    doc.autoTable({
      startY: 70,
      head: [['Code', 'Subject', 'Credits', 'Marks', 'Grade']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`SRM_Grade_Sheet_${user?.id}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Grade Sheet</h1>
          <p className="text-gray-500 font-medium italic">Consolidated academic performance report.</p>
        </div>
        <button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-all"
        >
          <Download size={18} /> Download PDF
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Summary Stats */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-cems-purple to-purple-800 rounded-[2rem] p-8 shadow-2xl shadow-purple-500/10 text-center">
            <Award className="mx-auto text-white mb-4" size={40} />
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Current GPA</p>
            <h2 className="text-5xl font-black text-white italic mb-4">{gpa}</h2>
            <div className="py-2 px-4 bg-white/10 rounded-full inline-block text-[10px] font-black text-white uppercase tracking-widest">
              Semester 4
            </div>
          </div>

          <div className="bg-cems-card rounded-[2rem] p-8 border border-gray-800">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <FileText size={18} className="text-cems-blue" /> Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold uppercase">Attempted</span>
                <span className="text-white font-black">{results.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold uppercase">Passed</span>
                <span className="text-green-500 font-black">{results.filter(r => r.grade !== 'F').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold uppercase">Arrears</span>
                <span className="text-red-500 font-black">{results.filter(r => r.grade === 'F').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results Table */}
        <div className="lg:col-span-3">
          <div className="bg-cems-card rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-800/20 border-b border-gray-800">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Subject</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Credits</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Marks</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res) => (
                  <tr key={res.evaluation_id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-white group-hover:text-cems-purple transition-colors">{res.subject_name}</div>
                      <div className="text-[10px] text-gray-600 font-mono mt-1">{res.subject_code}</div>
                    </td>
                    <td className="px-8 py-6 text-center text-sm font-bold text-gray-400">{res.credits}</td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-lg font-black text-white">{res.marks}</span>
                      <span className="text-xs text-gray-700">/100</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex w-12 h-12 rounded-xl items-center justify-center font-black italic text-xl shadow-lg ${
                        res.grade === 'O' ? 'bg-green-500 text-white shadow-green-500/20' :
                        res.grade === 'A+' ? 'bg-cems-blue text-white shadow-blue-500/20' :
                        res.grade === 'A' ? 'bg-cems-purple text-white shadow-purple-500/20' :
                        res.grade === 'F' ? 'bg-red-500 text-white shadow-red-500/20' :
                        'bg-gray-700 text-white'
                      }`}>
                        {res.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length === 0 && (
              <div className="p-20 text-center text-gray-600 italic">No results have been published for you yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
