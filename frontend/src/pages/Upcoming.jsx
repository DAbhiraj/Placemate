import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import axios from "axios";
import StatusBadge from "../components/UI/StatusBadge";
import { formatDateTime } from "../utils/helpers";

const UpcomingDeadlines = () => {
  const [upcoming, setUpcoming] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(""); // "deadline" or "interview"

  useEffect(() => {
    const fetchUpcoming = async () => {
      const userId = localStorage.getItem("id");
      const branch = "CSE";
      const cgpa = localStorage.getItem("cgpa") || 0;
      if (!userId) return;

      try {
        const res = await axios.get(
          `http://localhost:4000/api/upcoming-deadlines/${userId}`,
          { params: { branch, cgpa } }
        );

        // Normalize API data to have {id, company_name, role, date, type, status}
        const normalized = res.data.flatMap((job) => {
          const events = [];

          // Application deadline
          if (job.application_deadline) {
            events.push({
              id: `${job.job_id}-deadline`,
              company_name: job.company_name,
              role: job.role,
              date: job.application_deadline,
              type: "deadline",
              status: job.application_status,
            });
          }

          // Online assessment
          if (job.online_assessment_date) {
            events.push({
              id: `${job.job_id}-assessment`,
              company_name: job.company_name,
              role: job.role,
              date: job.online_assessment_date,
              type: "online assessment",
              status: job.application_status,
            });
          }

          // Interviews
          if (job.interview_dates?.length) {
            job.interview_dates.forEach((interviewDate, idx) => {
              events.push({
                id: `${job.job_id}-interview-${idx}`,
                company_name: job.company_name,
                role: job.role,
                date: interviewDate,
                type: "interview",
                status: job.application_status,
              });
            });
          }

          return events;
        });

        // Sort by date ascending
        normalized.sort((a, b) => new Date(a.date) - new Date(b.date));

        setUpcoming(normalized);
      } catch (err) {
        console.error("Failed to fetch upcoming deadlines:", err);
        setUpcoming([]);
      }
    };

    fetchUpcoming();
  }, []);

  const filteredUpcoming = upcoming.filter((item) => {
    const name = item.company_name?.toLowerCase() || "";
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesType =
      !filterType || item.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Upcoming Deadlines & Interviews
        </h1>
        <p className="text-gray-600">
          Track upcoming application deadlines and interview schedules
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="deadline">Deadline</option>
            <option value="online assessment">Online Assessment</option>
            <option value="interview">Interview</option>
          </select>
        </div>
      </div>

      {/* Upcoming Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filteredUpcoming.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No upcoming deadlines or interviews
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUpcoming.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDateTime(item.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;
