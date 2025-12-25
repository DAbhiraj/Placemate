import { useState } from "react"
import { Briefcase, Users, MessageSquare } from "lucide-react"

import CreateJob from "./CreateJob"
import ViewJobs from "./ViewJobs"
import SpocMessages from "./SpocMessages"
import Candidates from "./Candidates"

function RecruiterDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")

  //   const menuItems = [
  //     { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  //     { id: 'create' as const, label: 'Create Job', icon: Plus },
  //     { id: 'jobs' as const, label: 'View Jobs', icon: Briefcase },
  //     { id: 'messages' as const, label: 'SPOC Messages', icon: MessageSquare },
  //     { id: 'candidates' as const, label: 'Candidates', icon: Users },
  //   ];

  return (
    <div className="min-h-screen bg-gray-50">

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back!
                  </h1>
                  <p className="text-gray-600">
                    Here's an overview of your recruitment activities
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">3</p>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">140</p>
                    <p className="text-sm text-gray-600">Total Applications</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">12</p>
                    <p className="text-sm text-gray-600">Shortlisted</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">3</p>
                    <p className="text-sm text-gray-600">Unread Messages</p>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "create" && <CreateJob />}
            {activeSection === "jobs" && <ViewJobs />}
            {activeSection === "messages" && <SpocMessages />}
            {activeSection === "candidates" && <Candidates />}
          </div>
        </main>
      </div>
  )
}

export default RecruiterDashboard;
