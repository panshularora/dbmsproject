import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, User, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

const Malpractice = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/malpractice');
        setRecords(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching malpractice records", err);
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'Resolved') return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold uppercase"><CheckCircle2 size={12}/> Resolved</span>;
    return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold uppercase"><Clock size={12}/> Pending</span>;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Incident Reports</h1>
        <p className="text-gray-500">Academic integrity and malpractice monitoring</p>
      </header>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Fetching incident logs...</div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.malpractice_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:border-red-100 hover:shadow-red-50/50 hover:shadow-lg">
              <div className="w-full md:w-64 bg-red-50 p-6 flex flex-col justify-between items-center text-center">
                <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{record.student_name}</h3>
                  <p className="text-xs font-mono text-red-600 font-bold mt-1">{record.roll_no}</p>
                </div>
                <div className="mt-4">
                  {getStatusBadge(record.status)}
                </div>
              </div>
              
              <div className="flex-1 p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Subject</h4>
                    <p className="font-bold text-gray-900">{record.subject_name}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Reported By</h4>
                    <p className="text-sm font-medium text-gray-700">{record.reported_by}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Incident Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                    "{record.description}"
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 text-red-800">Action Taken</h4>
                  <p className="text-sm font-bold text-red-700">{record.action_taken}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Malpractice;
