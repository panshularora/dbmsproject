import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle2, Info, Plus, Loader2 } from 'lucide-react';

const Registration = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        setSubjects(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleRegister = async () => {
    setSubmitting(true);
    try {
      // Send registration request for every selected subject
      await Promise.all(
        selected.map(subjectId => 
          api.post('/register', {
            student_id: user.id,
            subject_id: subjectId,
            exam_id: 1 // Default exam
          })
        )
      );
      alert('Registration successful for all selected subjects!');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSubject = (id) => {
    if (selected.includes(id)) setSelected(selected.filter(i => i !== id));
    else setSelected([...selected, id]);
  };

  const totalCredits = subjects
    .filter(s => selected.includes(s.subject_id))
    .reduce((sum, s) => sum + (s.credits || 3), 0);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <header>
        <h1 className="text-3xl font-black text-white mb-2">Subject Registration</h1>
        <p className="text-gray-500 font-medium italic">Select your courses for the upcoming semester.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
            {Object.entries(
              subjects.reduce((acc, subject) => {
                const sem = subject.semester || 'Other';
                if (!acc[sem]) acc[sem] = [];
                acc[sem].push(subject);
                return acc;
              }, {})
            ).map(([semester, semsSubjects]) => (
              <div key={semester} className="mb-8 col-span-full">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Semester {semester}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {semsSubjects.map((subject) => (
                    <div 
                      key={subject.subject_id}
                      onClick={() => toggleSubject(subject.subject_id)}
                      className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${
                        selected.includes(subject.subject_id)
                          ? 'bg-cems-purple/10 border-cems-purple shadow-xl shadow-purple-500/10'
                          : 'bg-cems-card border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${selected.includes(subject.subject_id) ? 'bg-cems-purple text-white' : 'bg-gray-800 text-gray-400'}`}>
                          <BookOpen size={20} />
                        </div>
                        {selected.includes(subject.subject_id) && <CheckCircle2 className="text-cems-purple" />}
                      </div>
                      <h4 className="font-bold text-white mb-1">{subject.subject_name}</h4>
                      <p className="text-xs text-gray-500 mb-4">{subject.subject_code || `SUB-${subject.subject_id}`}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-800/50">
                        <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">{subject.type || 'Core'}</span>
                        <span className="px-3 py-1 bg-cems-bg rounded-full text-xs font-bold text-white">{subject.credits} Credits</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Sidebar Summary */}
        <div className="w-full lg:w-80">
          <div className="bg-cems-card rounded-[2rem] p-8 border border-gray-800 sticky top-10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Selection Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subjects Selected</span>
                <span className="text-white font-bold">{selected.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Credits</span>
                <span className="text-cems-blue font-bold text-xl">{totalCredits}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl mb-8">
              <div className="flex gap-3">
                <Info size={16} className="text-cems-blue shrink-0 mt-1" />
                <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                  A minimum of 18 credits is required for regular semester progression. Electives must be approved by your faculty advisor.
                </p>
              </div>
            </div>

            <button 
              onClick={handleRegister}
              disabled={selected.length === 0 || submitting}
              className="w-full py-4 bg-cems-purple text-white font-black rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-cems-purple transition-all shadow-xl shadow-purple-500/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" /> : 'Confirm Registration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
