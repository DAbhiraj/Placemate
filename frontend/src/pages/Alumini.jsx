import { useState, useEffect } from "react"
import { Search, Filter, ExternalLink, Calendar, Award } from "lucide-react"
import axios from "axios";

const Alumni = () => {
  const [alumniStories, setAlumniStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch alumni data using Axios
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/alumni");
        setAlumniStories(response.data);
      } catch (error) {
        console.error("Error fetching alumni:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, []);

  // ✅ Filtering logic
  const filteredStories = alumniStories.filter((story) => {
    const matchesSearch =
      story.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.currentRole?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = !filterBranch || story.branch === filterBranch;
    const matchesCompany = !filterCompany || story.company === filterCompany;
    return matchesSearch && matchesBranch && matchesCompany;
  });

  const uniqueBranches = [...new Set(alumniStories.map((s) => s.branch))];
  const uniqueCompanies = [...new Set(alumniStories.map((s) => s.company))];

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500">
        Loading alumni stories...
      </div>
    );
  }

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
          <div className="text-2xl font-bold text-purple-600">
            {
              (
                filteredStories.length > 0
                  ? filteredStories.reduce((sum, story) => {
                    // Sanitize and parse the package value
                    const pkg = parseFloat(story.package.replace(/[^0-9.]/g, '')) || 0;
                    //console.log(`Processing ${story.name}: ${story.package} -> ${pkg}`); // Debug log
                    return sum + pkg;
                  }, 0) / filteredStories.length
                  : 0
              ).toFixed(2) // Format to two decimal places
            }
          </div>


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
