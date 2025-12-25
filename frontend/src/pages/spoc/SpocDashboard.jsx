import { useState } from "react"
import {
  Briefcase,
  MessageSquare,
  Users,
  LayoutDashboard,
  Bell
} from "lucide-react"

import SpocAssignedJobs from "./SpocAssignedJobs"
import SpocJobNegotiation from "./SpocJobNegotiation"
import SpocStudentGroups from "./SpocStudentGroups"

export default function SpocDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="flex">
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome!
                  </h1>
                  <p className="text-gray-600">
                    You have 3 jobs assigned and 2 pending negotiations
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
                    <p className="text-sm text-gray-600">Assigned Jobs</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">2</p>
                    <p className="text-sm text-gray-600">In Discussion</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Briefcase className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">1</p>
                    <p className="text-sm text-gray-600">Finalized</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium text-left">
                        Review Pending Job Updates
                      </button>
                      <button className="w-full px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium text-left">
                        Continue Negotiations
                      </button>
                      <button className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium text-left">
                        View Student Groups
                      </button>
                      <button className="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium text-left">
                        Finalize Job Descriptions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </main>
      </div>
    </div>
  )
}
