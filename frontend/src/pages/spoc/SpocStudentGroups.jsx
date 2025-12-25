import { Users, Send, Phone, Video, MoreVertical, Plus } from 'lucide-react';

export default function SpocStudentGroups() {
  const groups = [
    {
      id: 1,
      jobTitle: 'Software Engineer',
      company: 'ABC Company Inc.',
      memberCount: 5,
      lastMessage: 'Interview round 1 scheduled for Dec 10 at 10 AM',
      timestamp: '1 hour ago',
      members: ['Sneha Reddy', 'Vikram Singh', 'Amit Kumar', 'Priya Patel', 'Rahul Sharma']
    },
    {
      id: 2,
      jobTitle: 'Data Analyst Intern',
      company: 'ABC Company Inc.',
      memberCount: 3,
      lastMessage: 'Please submit your coding assignments by EOD tomorrow',
      timestamp: '3 hours ago',
      members: ['Neha Gupta', 'Arjun Patel', 'Divya Sharma']
    }
  ];

  const currentGroup = groups[0];

  const groupMessages = [
    {
      id: 1,
      sender: 'spoc',
      name: 'Dr. Rajesh Kumar (SPOC)',
      message: 'Welcome everyone! Congratulations on being shortlisted for the Software Engineer position at ABC Company Inc.',
      timestamp: '2024-12-03, 10:00 AM',
      avatar: 'RK'
    },
    {
      id: 2,
      sender: 'student',
      name: 'Sneha Reddy',
      message: 'Thank you sir! We are very excited about this opportunity.',
      timestamp: '2024-12-03, 10:15 AM',
      avatar: 'SR'
    },
    {
      id: 3,
      sender: 'student',
      name: 'Vikram Singh',
      message: 'What will be the interview process?',
      timestamp: '2024-12-03, 10:30 AM',
      avatar: 'VS'
    },
    {
      id: 4,
      sender: 'spoc',
      name: 'Dr. Rajesh Kumar (SPOC)',
      message: 'The interview will have 2 rounds: Technical round (1 hour) and HR round (30 mins). We will schedule it for next week.',
      timestamp: '2024-12-03, 11:00 AM',
      avatar: 'RK'
    },
    {
      id: 5,
      sender: 'student',
      name: 'Amit Kumar',
      message: 'Will there be any coding round?',
      timestamp: '2024-12-03, 11:15 AM',
      avatar: 'AK'
    },
    {
      id: 6,
      sender: 'spoc',
      name: 'Dr. Rajesh Kumar (SPOC)',
      message: 'Yes, the technical round will include a coding assessment. Start preparing from topics like DSA, System Design, and Core Java.',
      timestamp: '2024-12-03, 11:30 AM',
      avatar: 'RK'
    },
    {
      id: 7,
      sender: 'spoc',
      name: 'Dr. Rajesh Kumar (SPOC)',
      message: 'Interview round 1 scheduled for Dec 10 at 10 AM',
      timestamp: '1 hour ago',
      avatar: 'RK'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[700px] flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Student Interview Groups</h2>
              <p className="text-sm text-gray-500">Communicate with shortlisted candidates</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            New Group
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 flex-1 overflow-hidden">
        <div className="col-span-1 border-r border-gray-200 overflow-y-auto bg-gray-50">
          {groups.map((group) => (
            <div
              key={group.id}
              className="p-4 border-b border-gray-200 hover:bg-white cursor-pointer transition-colors"
            >
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{group.jobTitle}</h3>
              <p className="text-xs text-gray-500 mb-2">{group.company}</p>
              <div className="flex items-center gap-1 mb-2">
                <Users className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600">{group.memberCount} members</span>
              </div>
              <p className="text-sm text-gray-600 truncate mb-1">{group.lastMessage}</p>
              <p className="text-xs text-gray-400">{group.timestamp}</p>
            </div>
          ))}
        </div>

        <div className="col-span-3 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{currentGroup.jobTitle}</h3>
              <p className="text-sm text-gray-600">{currentGroup.company}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-white">
            {groupMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex gap-3"
              >
                <div className={`${
                  msg.sender === 'spoc'
                    ? 'bg-green-600'
                    : 'bg-blue-600'
                } rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white`}>
                  {msg.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{msg.name}</p>
                  <div className="bg-gray-100 rounded-lg p-3 mt-1">
                    <p className="text-sm text-gray-900">{msg.message}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type your message to the group..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
              <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
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
