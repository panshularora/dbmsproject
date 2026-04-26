import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import StudentLayout from './components/StudentLayout';
import StudentDashboard from './pages/StudentDashboard';
import Registration from './pages/Registration';
import StudentTimetable from './pages/StudentTimetable';
import SeatAllocation from './pages/SeatAllocation';
import StudentResults from './pages/StudentResults';
import Malpractice from './pages/Malpractice';

import FacultyLayout from './components/FacultyLayout';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyEvaluations from './pages/FacultyEvaluations';
import FacultyStudents from './pages/FacultyStudents';
import FacultyMalpractice from './pages/FacultyMalpractice';

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/faculty/dashboard'} />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="registration" element={<Registration />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="seat" element={<SeatAllocation />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="malpractice" element={<Malpractice />} />
          </Route>

          {/* Faculty Routes */}
          <Route path="/faculty" element={<ProtectedRoute role="faculty"><FacultyLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="evaluations" element={<FacultyEvaluations />} />
            <Route path="students" element={<FacultyStudents />} />
            <Route path="malpractice" element={<FacultyMalpractice />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
