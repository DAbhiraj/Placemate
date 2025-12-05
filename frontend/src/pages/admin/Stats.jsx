import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#4CAF50", "#FF5252"]; // Green = Placed, Red = Unplaced

const Stats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/admin/dashboard/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="text-center py-10">Loading dashboard stats...</div>;

  const { totalStudents, totalPlacements, placementsByBranch } = stats;

  // Pie chart data
  const unplaced = totalStudents - totalPlacements;
  const pieData = [
    { name: "Placed", value: totalPlacements },
    { name: "Unplaced", value: unplaced },
  ];

  // Bar chart data (students placed per branch)
  const barData = placementsByBranch || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      {/* --- Pie Chart --- */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Placement Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* --- Bar Chart --- */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Placements by Branch</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="branch" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="placed" name="Placed Students" fill="#4F46E5" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Stats;
