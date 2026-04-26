import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Layout, Users, Grid, Info } from 'lucide-react';

const HallAllocations = () => {
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/halls');
        setHalls(res.data);
        if (res.data.length > 0) setSelectedHall(res.data[0]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching halls", err);
        setLoading(false);
      }
    };
    fetchHalls();
  }, []);

  useEffect(() => {
    if (selectedHall) {
      const fetchAllocations = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/allocations?hall_id=${selectedHall.hall_id}&limit=60`);
          setAllocations(res.data);
        } catch (err) {
          console.error("Error fetching allocations", err);
        }
      };
      fetchAllocations();
    }
  }, [selectedHall]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Hall Allocations</h1>
        <p className="text-gray-500">View and manage seating arrangements</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Hall Selection List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">Select Hall</h3>
          {halls.map(hall => (
            <button
              key={hall.hall_id}
              onClick={() => setSelectedHall(hall)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedHall?.hall_id === hall.hall_id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                  : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'
              }`}
            >
              <div className="font-bold">{hall.hall_name}</div>
              <div className={`text-xs mt-1 ${selectedHall?.hall_id === hall.hall_id ? 'text-blue-100' : 'text-gray-400'}`}>
                Capacity: {hall.capacity} Seats
              </div>
            </button>
          ))}
        </div>

        {/* Seating Matrix */}
        <div className="lg:col-span-3">
          {selectedHall && (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedHall.hall_name}</h2>
                  <p className="text-sm text-gray-500">Seating Plan (Total Seats: {selectedHall.capacity})</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div> Allocated
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <div className="w-3 h-3 bg-gray-100 rounded border border-gray-200"></div> Empty
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {Array.from({ length: selectedHall.capacity }).map((_, index) => {
                  const seatNo = index + 1;
                  const allocation = allocations.find(a => a.seat_no === seatNo);
                  return (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg border flex items-center justify-center text-[10px] font-bold transition-all relative group cursor-pointer ${
                        allocation 
                          ? 'bg-blue-600 text-white border-blue-700 shadow-sm' 
                          : 'bg-gray-50 text-gray-300 border-gray-100'
                      }`}
                    >
                      {seatNo}
                      {allocation && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-navy-900 text-white rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                          <div className="font-black text-blue-400 uppercase text-[8px] mb-1">Student</div>
                          {allocation.student_name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Info size={20} />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-blue-900">Seating Logic</p>
                  <p className="text-blue-700">Candidates from different branches are interspersed to prevent malpractice. Attendance sheets are generated based on this layout.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HallAllocations;
