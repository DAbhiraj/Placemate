import React, { useState } from "react"
import { Search, Filter, ExternalLink, Calendar, Award } from "lucide-react"

const Alumni = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBranch, setFilterBranch] = useState("")
  const [filterCompany, setFilterCompany] = useState("")

  const alumniStories = [
    {
      id: "1",
      name: "Rahul Verma",
      batch: "2022",
      branch: "Computer Science",
      company: "Google",
      package: "₹52 LPA",
      image: "👨‍💻",
      currentRole: "Software Engineer",
      story:
        "My journey at NIT Warangal was transformative. I focused heavily on competitive programming and open source contributions. The placement training provided by CCPD was excellent and helped me crack multiple top-tier companies. The key was consistent practice and building strong fundamentals.",
      tips: [
        "Practice DSA daily for at least 2-3 hours",
        "Build 2-3 strong projects that showcase your skills",
        "Network with seniors and alumni",
        "Participate in coding competitions regularly",
        "Focus on system design for senior roles"
      ]
    },
    {
      id: "2",
      name: "Sneha Patel",
      batch: "2021",
      branch: "Electronics",
      company: "Microsoft",
      package: "₹48 LPA",
      image: "👩‍💼",
      currentRole: "Cloud Solutions Architect",
      story:
        "I started with web development during my second year and gradually moved to cloud technologies. Internships played a crucial role in building my profile. The transition from electronics to software was challenging but rewarding. Microsoft's culture of innovation aligns perfectly with my goals.",
      tips: [
        "Do internships to gain real-world experience",
        "Learn cloud platforms like Azure, AWS",
        "Contribute to open source projects",
        "Build a strong LinkedIn presence",
        "Don't be afraid to switch domains if passionate"
      ]
    },
    {
      id: "3",
      name: "Arjun Kumar",
      batch: "2023",
      branch: "Mechanical",
      company: "Tesla",
      package: "₹45 LPA",
      image: "👨‍🔧",
      currentRole: "Software Engineer",
      story:
        "Transitioning from core mechanical to software was one of the best decisions I made. Online courses, hackathons, and personal projects were game-changers. Tesla's mission to accelerate sustainable transport resonates with my values. The interview process was rigorous but fair.",
      tips: [
        "Be adaptable and open to learning new technologies",
        "Take online courses to bridge knowledge gaps",
        "Participate in hackathons and coding competitions",
        "Build projects that solve real-world problems",
        "Network with professionals in your target industry"
      ]
    },
    {
      id: "4",
      name: "Priya Sharma",
      batch: "2022",
      branch: "Information Technology",
      company: "Amazon",
      package: "₹42 LPA",
      image: "👩‍💻",
      currentRole: "SDE-2",
      story:
        "System design and leadership experience through college projects helped me crack Amazon's interview. The bar raiser round was particularly challenging. Amazon's leadership principles are not just words - they're lived every day. The learning curve is steep but incredibly rewarding.",
      tips: [
        "Focus on system design fundamentals",
        "Lead team projects to gain leadership experience",
        "Practice mock interviews extensively",
        "Understand the company culture and values",
        "Be prepared for behavioral questions"
      ]
    },
    {
      id: "5",
      name: "Vikram Singh",
      batch: "2020",
      branch: "Computer Science",
      company: "Meta",
      package: "₹55 LPA",
      image: "👨‍💼",
      currentRole: "Senior Software Engineer",
      story:
        "Meta's focus on connecting people globally attracted me. The interview process tested both technical skills and cultural fit. Working on products used by billions is both exciting and challenging. The company invests heavily in employee growth and cutting-edge technology.",
      tips: [
        "Master data structures and algorithms",
        "Understand distributed systems",
        "Practice coding on a whiteboard",
        "Stay updated with latest tech trends",
        "Build products that scale"
      ]
    },
    {
      id: "6",
      name: "Ananya Reddy",
      batch: "2021",
      branch: "Electronics",
      company: "Apple",
      package: "₹50 LPA",
      image: "👩‍🔬",
      currentRole: "Hardware Engineer",
      story:
        "Apple's commitment to innovation and design excellence made it my dream company. The interview process was comprehensive, covering both technical and design thinking aspects. Working on products that millions love is incredibly fulfilling. The attention to detail here is unmatched.",
      tips: [
        "Focus on fundamentals of your core domain",
        "Develop design thinking skills",
        "Understand user experience principles",
        "Practice problem-solving under pressure",
        "Show passion for the company's products"
      ]
    }
  ]

  const filteredStories = alumniStories.filter(story => {
    const matchesSearch =
      story.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.currentRole.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = !filterBranch || story.branch === filterBranch
    const matchesCompany = !filterCompany || story.company === filterCompany
    return matchesSearch && matchesBranch && matchesCompany
  })

  const uniqueBranches = [...new Set(alumniStories.map(story => story.branch))]
  const uniqueCompanies = [
    ...new Set(alumniStories.map(story => story.company))
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Alumni Success Stories</h1>
        <p className="text-purple-100">
          Learn from the experiences of our successful alumni and get inspired
          for your placement journey
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {alumniStories.length}
          </div>
          <div className="text-sm text-gray-500">Success Stories</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {uniqueCompanies.length}
          </div>
          <div className="text-sm text-gray-500">Top Companies</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">₹49L</div>
          <div className="text-sm text-gray-500">Avg Package</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {uniqueBranches.length}
          </div>
          <div className="text-sm text-gray-500">Branches</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, company, or role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterBranch}
            onChange={e => setFilterBranch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Branches</option>
            {uniqueBranches.map(branch => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>

          <select
            value={filterCompany}
            onChange={e => setFilterCompany(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Companies</option>
            {uniqueCompanies.map(company => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alumni Stories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStories.length === 0 ? (
          <div className="lg:col-span-2 text-center py-12">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No stories found
            </h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredStories.map(alumni => (
            <div
              key={alumni.id}
              className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Alumni Header */}
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">{alumni.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {alumni.name}
                      </h3>
                      <button className="text-gray-400 hover:text-blue-600">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {alumni.branch} • Batch {alumni.batch}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm font-medium text-blue-600">
                        {alumni.company}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {alumni.package}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {alumni.currentRole}
                    </p>
                  </div>
                </div>

                {/* Story */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed italic">
                    "{alumni.story}"
                  </p>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Award className="w-4 h-4 mr-2 text-yellow-500" />
                    Key Tips for Success:
                  </h4>
                  <ul className="space-y-2">
                    {alumni.tips.slice(0, 3).map((tip, tipIndex) => (
                      <li
                        key={tipIndex}
                        className="text-sm text-gray-600 flex items-start"
                      >
                        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  {alumni.tips.length > 3 && (
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2">
                      View all {alumni.tips.length} tips →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Alumni;
