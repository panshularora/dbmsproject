import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Users, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    subjects: 0,
    malpractices: 0,
    avgMarks: 0
  });
  const [toppers, setToppers] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, subjectsRes, malRes, topperRes, evaluationsRes, registrationsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/students?limit=1'),
          axios.get('http://localhost:5000/api/subjects?limit=1'),
          axios.get('http://localhost:5000/api/malpractice'),
          axios.get('http://localhost:5000/api/students/topper?limit=5'),
          axios.get('http://localhost:5000/api/evaluations'),
          axios.get('http://localhost:5000/api/registrations')
        ]);

        setToppers(topperRes.data);
        
        // Process grade distribution
        const grades = evaluationsRes.data.reduce((acc, curr) => {
          acc[curr.grade] = (acc[curr.grade] || 0) + 1;
          return acc;
        }, {});

        const pieData = Object.keys(grades).map(key => ({
          name: key,
          value: grades[key]
        }));
        setGradeData(pieData);

        // Calculate average marks
        const totalMarks = evaluationsRes.data.reduce((acc, curr) => acc + curr.marks, 0);
        const avg = evaluationsRes.data.length > 0 ? (totalMarks / evaluationsRes.data.length).toFixed(1) : 0;

        setStats({
          students: 1200, 
          subjects: 36,
          malpractices: malRes.data.length,
          avgMarks: avg
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  );

  if (loading) return <div className="flex justify-center items-center h-full text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Academic Overview</h1>
        <p className="text-gray-500">Welcome back, Administrator</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={stats.students} 
          icon={<Users className="text-blue-600" />} 
          color="bg-blue-50"
        />
        <StatCard 
          title="Total Subjects" 
          value={stats.subjects} 
          icon={<BookOpen className="text-emerald-600" />} 
          color="bg-emerald-50"
        />
        <StatCard 
          title="Avg. Performance" 
          value={`${stats.avgMarks}%`} 
          icon={<GraduationCap className="text-purple-600" />} 
          color="bg-purple-50"
        />
        <StatCard 
          title="Malpractice Cases" 
          value={stats.malpractices} 
          icon={<AlertCircle className="text-red-600" />} 
          color="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grade Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Grade Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-4 font-semibold text-gray-600 text-sm">Student Name</th>
                  <th className="pb-4 font-semibold text-gray-600 text-sm">Avg Marks</th>
                  <th className="pb-4 font-semibold text-gray-600 text-sm">Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {toppers.map((topper, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 text-sm font-medium text-gray-900">{topper.student_name}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                        {parseFloat(topper.avg_marks).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-500">{topper.subjects_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
