import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Results from './pages/Results';
import Timetable from './pages/Timetable';
import HallAllocations from './pages/HallAllocations';
import Malpractice from './pages/Malpractice';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="results" element={<Results />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="hall-allocations" element={<HallAllocations />} />
          <Route path="malpractice" element={<Malpractice />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
