import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  CheckCircle,
  Award,
  Calendar,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import StatCard from "../../components/UI/StatCard";
import StatusBadge from "../../components/UI/StatusBadge";
import Loader from "../../components/UI/Loader";
import axios from "axios";
import { formatDateTime } from "../../utils/helpers";

const API_URL = import.meta.env.VITE_API_URL ;

// ✅ Helper function to check eligibility
const isEligible = (job, user) => {
  if (!user || !job) return false;
  const minCGPA = parseFloat(job.min_cgpa) || 0;
  const userCGPA = parseFloat(user.cgpa) || 0;
  const eligibleBranches = Array.isArray(job.eligible_branches)
    ? job.eligible_branches
    : [];

  return eligibleBranches.includes(user.branch) && userCGPA >= minCGPA;
};

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const u_id = localStorage.getItem("id");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const branch = localStorage.getItem("branch");
    const cgpa = localStorage.getItem("cgpa");
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (u_id && name && email && branch && cgpa && role) {
      setCurrentUser({ u_id, name, email, branch, cgpa, role, token });
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // ✅ Fetch Applications
        console.log("fetching data");
        console.log(`${API_URL}/applications/userId/${currentUser.u_id}`)
        const appRes = await axios.get(
          `${API_URL}/applications/userId/${currentUser.u_id}`
        );
        const normalizedApps = (appRes.data || []).map((a) => ({
          appl_id: a.appl_id,
          job_id: a.job_id,
          company_name: a.company_name ?? "N/A",
          role: a.role ?? "N/A",
          status: a.status ?? "applied",
          appliedDate: a.created_at || a.updated_at,
          lastUpdate: a.updated_at || a.created_at,
          interview_date: a.interview_date,
        }));
        setApplications(normalizedApps);

        // ✅ Fetch All Jobs
        const jobRes = await axios.get(`${API_URL}/jobs`);
        const normalizedJobs = (jobRes.data || []).map((job) => ({
          ...job,
          eligible_branches: job.eligible_branches || [],
          min_cgpa: parseFloat(job.min_cgpa) || 0,
          company_name: job.company_name ?? "Unknown Company",
          package_range: job.package_range ?? "Not Disclosed",
          company_logo: job.company_logo ?? null,
        }));
        setAllJobs(normalizedJobs);

        // ✅ Fetch All 3 Types of Upcoming Deadlines
        console.log("in dashboard for checking upcoming");
        console.log(`${API_URL}/upcoming-deadlines/${currentUser.u_id}`);
        console.log(currentUser.branch);
        console.log(currentUser.cgpa);
        
        // Fetch all 3 types in parallel
        const [appDeadlineRes, assessmentRes, interviewRes] = await Promise.all([
          axios.get(`${API_URL}/upcoming-deadlines/${currentUser.u_id}?type=application`, 
            { params: { branch: currentUser.branch, cgpa: currentUser.cgpa } }),
          axios.get(`${API_URL}/upcoming-deadlines/${currentUser.u_id}?type=assessment`, 
            { params: { branch: currentUser.branch, cgpa: currentUser.cgpa } }),
          axios.get(`${API_URL}/upcoming-deadlines/${currentUser.u_id}?type=interview`, 
            { params: { branch: currentUser.branch, cgpa: currentUser.cgpa } })
        ]);

        // Combine all upcoming events
        const allUpcoming = [];

        // Add application deadlines
        (appDeadlineRes.data || []).forEach((job) => {
          allUpcoming.push({
            type: "deadline",
            id: `${job.job_id}-deadline`,
            job_id: job.job_id,
            company_name: job.company_name,
            role: job.role,
            date: job.application_deadline,
            status: job.application_status,
          });
        });

        // Add online assessments
        (assessmentRes.data || []).forEach((job) => {
          allUpcoming.push({
            type: "assessment",
            id: `${job.job_id}-assessment`,
            job_id: job.job_id,
            company_name: job.company_name,
            role: job.role,
            date: job.online_assessment_date,
            status: job.application_status,
          });
        });

        // Add interviews
        (interviewRes.data || []).forEach((job) => {
          if (job.interview_dates?.length) {
            job.interview_dates.forEach((date, idx) => {
              allUpcoming.push({
                type: "interview",
                id: `${job.job_id}-interview-${idx}`,
                job_id: job.job_id,
                company_name: job.company_name,
                role: job.role,
                date: date,
                status: job.application_status,
              });
            });
          }
        });

        // Sort by date and take top 3
        const sortedUpcoming = allUpcoming
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);

        setUpcoming(sortedUpcoming);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // ✅ Use the combined upcoming events from API
  const upcomingEvents = useMemo(() => {
    return upcoming;
  }, [upcoming]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate))
      .slice(0, 3);
  }, [applications]);

  return (
    <div className="space-y-6">
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {localStorage.getItem('name')}! 
            </h1> 
            <p className="text-blue-100">
              Track your placement journey and stay updated with the latest
              opportunities. 
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/jobs"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                    Browse Opportunities
                  </h4>
                  <p className="text-sm text-gray-500">Explore new roles</p>
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
                  <p className="text-sm text-gray-500">Keep your CGPA updated</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              </Link>

              <Link
                to="/applications"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                    My Applications
                  </h4>
                  <p className="text-sm text-gray-500">Track your progress</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              </Link>
            </div>
          </div>

      {/* Recent Activity and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h3>
            <Link
              to="/applications"
              className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No applications yet</p>
              <Link
                to="/jobs"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Browse Opportunities
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.appl_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {app.company_name}
                    </p>
                    <p className="text-sm text-gray-500">Role: {app.role}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={app.status} />
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDateTime(app.lastUpdate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Events
            </h3>
            <Link
              to="/upcoming"
              className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming events</p>
              <p className="text-sm text-gray-400">
                Eligible job deadlines or interviews will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                // Application Deadline
                if (event.type === "deadline") {
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-400"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">📋</div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {event.company_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {event.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          {formatDateTime(event.date, { dateOnly: true })}
                        </p>
                        <p className="text-xs text-gray-500">Application</p>
                      </div>
                    </div>
                  );
                }

                // Online Assessment
                if (event.type === "assessment") {
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">📝</div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {event.company_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {event.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-yellow-600">
                          {formatDateTime(event.date, { dateOnly: true })}
                        </p>
                        <p className="text-xs text-gray-500">Assessment</p>
                      </div>
                    </div>
                  );
                }

                // Interview
                if (event.type === "interview") {
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400"
                    >
                      <div className="flex items-center space-x-3">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {event.company_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {event.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-purple-600">
                          {formatDateTime(event.date)}
                        </p>
                        <p className="text-xs text-gray-500">Interview</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>

      
        </>
      )}
    </div>
  );
};

export default Dashboard;
