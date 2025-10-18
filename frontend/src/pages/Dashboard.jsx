import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, CheckCircle, Users, Award, Calendar, ArrowRight } from "lucide-react";
import StatCard from "../components/UI/StatCard";
import StatusBadge from "../components/UI/StatusBadge";
import axios from "axios";
import { formatDateTime } from "../utils/helpers";

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    // Load current user from localStorage (separate items)
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const branch = localStorage.getItem("branch");
    const cgpa = localStorage.getItem("cgpa");
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    const u_id = localStorage.getItem("id");

    if (u_id && name && email && branch && cgpa && role) {
      setCurrentUser({ u_id, name, email, branch, cgpa, role, token });
    }

    const fetchData = async () => {
      try {
        if (email) {

          const appRes = await axios.get(`http://localhost:4000/api/applications/userId/${u_id}`);
          const raw = Array.isArray(appRes.data) ? appRes.data : [];
          const normalized = raw.map((a, idx) => ({
            id: idx + 1,
            company_name: a.company_name ?? "",
            role: a.role ?? "",
            status: a.status ?? "applied",
            appliedDate: a.created_at || a.applied_at || a.updated_at,
            lastUpdate: a.updated_at || a.created_at,
          }));
          setApplications(normalized);
        }

        // // Fetch companies (example: first 10)
        // const companyRes = await axios.get(`/api/companies`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setCompanies(companyRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  const recentApplications = applications.slice(0, 3);
  const upcomingDeadlines = companies.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {currentUser?.name}!
        </h1>
        <p className="text-blue-100">
          Track your placement journey and stay updated with the latest opportunities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Applications"
          value={applications.length}
          icon={FileText}
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
        />

        <StatCard
          title="Shortlisted"
          value={applications.filter(app => app.status === "shortlisted").length}
          icon={CheckCircle}
          gradient="bg-gradient-to-r from-green-500 to-green-600"
        />

        <StatCard
          title="Interviews"
          value={applications.filter(app => app.status === "interviewed").length}
          icon={Users}
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
        />

        <StatCard
          title="Resume Score"
          value={`${currentUser?.cgpa}/10`}
          icon={Award}
          gradient="bg-gradient-to-r from-orange-500 to-orange-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
            <Link
              to="/applications"
              className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No applications yet</p>
                <Link
                  to="/companies"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Browse Companies
                </Link>
              </div>
            ) : (
              recentApplications.map(application => {
                return (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">{application.company_name}</p>
                        <p className="text-sm text-gray-500">
                          Applied on {formatDateTime(application.updated_at)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingDeadlines.map(company => (
              <div
                key={company.id}
                className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-400"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{company.logo}</div>
                  <div>
                    <p className="font-medium text-gray-900">{company.name}</p>
                    <p className="text-sm text-gray-500">{company.package}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">{company.deadline}</p>
                  <p className="text-xs text-gray-500">Deadline</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/companies"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                Browse Companies
              </h4>
              <p className="text-sm text-gray-500">Explore new opportunities</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          </Link>

          <Link
            to="/profile"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                Update Profile
              </h4>
              <p className="text-sm text-gray-500">Improve your resume score</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          </Link>

          <Link
            to="/alumni"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                Alumni Stories
              </h4>
              <p className="text-sm text-gray-500">Learn from success stories</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
