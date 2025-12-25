import { useState } from "react"
import { MessageSquare, Send, AlertCircle, ArrowLeft } from "lucide-react"

function SpocJobNegotation() {
  const [selectedChatId, setSelectedChatId] = useState(null)

  const negotiationChats = [
    {
      id: 1,
      jobTitle: "Software Engineer",
      company: "ABC Company Inc.",
      lastMessage: "We can adjust the minimum CGPA to 7.5. Is that acceptable?",
      timestamp: "2 hours ago",
      unread: 1
    },
    {
      id: 2,
      jobTitle: "Data Analyst Intern",
      company: "XYZ Tech Solutions",
      lastMessage: "Can you specify the required skills more clearly?",
      timestamp: "5 hours ago",
      unread: 0
    },
    {
      id: 3,
      jobTitle: "Frontend Developer",
      company: "Tech Innovators Ltd",
      lastMessage: "The stipend amount has been approved.",
      timestamp: "1 day ago",
      unread: 2
    }
  ]

  const currentChat = {
    jobTitle: "Software Engineer",
    company: "ABC Company Inc.",
    messages: [
      {
        id: 1,
        sender: "recruiter",
        name: "ABC Company Inc.",
        message:
          "Hi! We are looking to post a Software Engineer position. We need candidates with 8.0+ CGPA.",
        timestamp: "2024-12-01, 10:30 AM"
      },
      {
        id: 2,
        sender: "spoc",
        message:
          "That CGPA requirement might be too high. Most eligible students have 7.5-7.8. Can we adjust?",
        timestamp: "2024-12-01, 11:00 AM"
      },
      {
        id: 3,
        sender: "recruiter",
        message:
          "Hmm, 7.5 is the minimum we can go. But we can be flexible with the skills requirement.",
        timestamp: "2024-12-01, 11:30 AM"
      },
      {
        id: 4,
        sender: "spoc",
        message:
          "Great! Can you clarify which programming languages are essential vs. nice-to-have?",
        timestamp: "2024-12-01, 2:00 PM"
      },
      {
        id: 5,
        sender: "recruiter",
        message:
          "We can adjust the minimum CGPA to 7.5. Essential: Java, Spring Boot. Nice-to-have: React, AWS.",
        timestamp: "2 hours ago"
      }
    ]
  }

  const handleChatSelect = chatId => {
    setSelectedChatId(chatId)
  }

  const handleBackToList = () => {
    setSelectedChatId(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-xl shadow-none sm:shadow-sm border-0 sm:border sm:border-gray-200 overflow-hidden h-screen sm:h-[700px] w-full sm:max-w-6xl flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Job Negotiations
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Discuss job requirements with recruiters
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div
            className={`w-full md:w-1/3 bg-gray-50 overflow-y-auto border-r border-gray-200 transition-transform duration-300 absolute md:relative inset-y-0 left-0 ${
              selectedChatId
                ? "-translate-x-full md:translate-x-0"
                : "translate-x-0"
            }`}
          >
            {negotiationChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className="p-4 border-b border-gray-200 hover:bg-white cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {chat.jobTitle}
                    </h3>
                    <p className="text-xs text-gray-500">{chat.company}</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mb-1">
                  {chat.lastMessage}
                </p>
                <p className="text-xs text-gray-400">{chat.timestamp}</p>
              </div>
            ))}
          </div>

          <div
            className={`w-full md:w-2/3 bg-white flex flex-col transition-transform duration-300 absolute md:relative inset-y-0 right-0 ${
              selectedChatId
                ? "translate-x-0"
                : "translate-x-full md:translate-x-0"
            }`}
          >
            {selectedChatId ? (
              <>
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {currentChat.jobTitle}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentChat.company}
                    </p>
                  </div>
                </div>

                <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto bg-white">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Ongoing Discussion</p>
                      <p>
                        Discussing CGPA requirement and technical skills with
                        the recruiter.
                      </p>
                    </div>
                  </div>

                  {currentChat.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.sender === "spoc" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.sender === "recruiter" && (
                        <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-600">
                          ABC
                        </div>
                      )}
                      <div
                        className={`max-w-xs sm:max-w-sm ${
                          msg.sender === "spoc"
                            ? "bg-blue-600 text-white rounded-lg rounded-tr-none"
                            : "bg-gray-100 text-gray-900 rounded-lg rounded-tl-none"
                        } p-3 shadow-sm`}
                      >
                        <p className="text-sm mb-1">{msg.message}</p>
                        <p
                          className={`text-xs ${
                            msg.sender === "spoc"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2 sm:gap-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                    <button className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    Select a chat to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpocJobNegotation
