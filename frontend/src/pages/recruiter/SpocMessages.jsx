import { MessageSquare, Send, Search, User } from 'lucide-react';

export default function SpocMessages() {
  const messages = [
    {
      id: 1,
      spocName: 'Dr. Rajesh Kumar',
      role: 'Placement Coordinator',
      department: 'Computer Science',
      lastMessage: 'Thank you for posting the job. Can we schedule an initial screening session?',
      timestamp: '2 hours ago',
      unread: 2
    },
    {
      id: 2,
      spocName: 'Prof. Anita Sharma',
      role: 'Training & Placement Officer',
      department: 'Electronics',
      lastMessage: 'The shortlisted candidates list has been prepared. Please review.',
      timestamp: '5 hours ago',
      unread: 0
    },
    {
      id: 3,
      spocName: 'Dr. Vikram Patel',
      role: 'HOD - IT Department',
      department: 'Information Technology',
      lastMessage: 'We have 15 eligible students for the Data Analyst position.',
      timestamp: '1 day ago',
      unread: 1
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">SPOC Messages</h2>
              <p className="text-sm text-gray-500">Single Point of Contact Communications</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages or SPOC names..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-5">
        <div className="col-span-2 border-r border-gray-200 max-h-[600px] overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {msg.spocName}
                    </h3>
                    {msg.unread > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {msg.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {msg.role} • {msg.department}
                  </p>
                  <p className="text-sm text-gray-600 truncate mb-1">{msg.lastMessage}</p>
                  <p className="text-xs text-gray-400">{msg.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-3 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Dr. Rajesh Kumar</h3>
                <p className="text-xs text-gray-500">Placement Coordinator • Computer Science</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50" style={{ maxHeight: '400px' }}>
            <div className="flex gap-3">
              <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-lg p-3 max-w-md shadow-sm">
                <p className="text-sm text-gray-900">
                  Hello! We have reviewed your job posting for Software Engineer position. We have around 45 eligible students.
                </p>
                <p className="text-xs text-gray-400 mt-2">Yesterday, 3:45 PM</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <div className="bg-blue-600 rounded-lg p-3 max-w-md shadow-sm">
                <p className="text-sm text-white">
                  That's great! Could you please share the list of eligible candidates with their resumes?
                </p>
                <p className="text-xs text-blue-100 mt-2">Yesterday, 4:12 PM</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-lg p-3 max-w-md shadow-sm">
                <p className="text-sm text-gray-900">
                  Thank you for posting the job. Can we schedule an initial screening session?
                </p>
                <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
