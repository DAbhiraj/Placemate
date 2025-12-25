import { useState } from "react"
import { Bell, Send, Users, CheckSquare } from "lucide-react"


// Mantine direct imports
import {
  Card,
  CardSection,
  TextInput,
  Textarea,
  Button,
  Checkbox,
  Text,
  Title,
  Group
} from "@mantine/core"

const roles = [
  { id: "students", label: "Students", count: 450 },
  { id: "placement-coordinators", label: "Placement Coordinators", count: 5 },
  { id: "spocs", label: "SPOCs", count: 8 },
  { id: "recruiters", label: "Recruiters", count: 45 },
  { id: "companies", label: "Companies", count: 32 }
]

const recentNotifications = [
  {
    id: 1,
    title: "New Job Opening - Tech Corp",
    recipients: "Students",
    sentAt: "2024-03-15 10:30 AM",
    sentBy: "Admin"
  },
  {
    id: 2,
    title: "OT Schedule Update",
    recipients: "Students, SPOCs",
    sentAt: "2024-03-14 03:45 PM",
    sentBy: "Admin"
  },
  {
    id: 3,
    title: "Company Verification Complete",
    recipients: "Recruiters",
    sentAt: "2024-03-13 11:20 AM",
    sentBy: "Admin"
  }
]

export default function SendNotifications() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [selectedRoles, setSelectedRoles] = useState([])
  

  const handleRoleToggle = roleId => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const handleSelectAll = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([])
    } else {
      setSelectedRoles(roles.map(r => r.id))
    }
  }

  const handleSendNotification = () => {
    if (!title || !message || selectedRoles.length === 0) {
      return
    }

    const totalRecipients = roles
      .filter(r => selectedRoles.includes(r.id))
      .reduce((sum, r) => sum + r.count, 0)

    setTitle("")
    setMessage("")
    setSelectedRoles([])
  }

  const totalRecipients = roles
    .filter(r => selectedRoles.includes(r.id))
    .reduce((sum, r) => sum + r.count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Send Notifications
        </h1>
        <p className="text-slate-600 mt-1">
          Send role-based notifications to users
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card shadow="sm" padding="lg" radius="md">
            <Title order={3} className="text-slate-900 flex items-center mb-4">
              <Bell className="h-5 w-5 mr-2" />
              Compose Notification
            </Title>

            <div className="space-y-4">
              <div>
                <Text className="text-slate-700 mb-1">Notification Title</Text>
                <TextInput
                  placeholder="Enter notification title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Text className="text-slate-700 mb-1">Message</Text>
                <Textarea
                  placeholder="Enter your message here..."
                  value={message}
                  minRows={6}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Text className="text-slate-700">Select Recipients</Text>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={handleSelectAll}
                  >
                    <CheckSquare className="h-4 w-4 mr-1" />
                    {selectedRoles.length === roles.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  {roles.map(role => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedRoles.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          label={role.label}
                        />
                      </div>
                      <span className="text-sm text-slate-600">
                        {role.count} users
                      </span>
                    </div>
                  ))}
                </div>

                {selectedRoles.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <Users className="h-4 w-4 inline mr-1" />
                      Total recipients:{" "}
                      <span className="font-semibold">{totalRecipients}</span>
                    </p>
                  </div>
                )}
              </div>

              <Button
                fullWidth
                onClick={handleSendNotification}
                disabled={!title || !message || selectedRoles.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </div>
          </Card>
        </div>

        <div>
          <Card shadow="sm" padding="lg" radius="md">
            <Title order={4} className="text-slate-900 mb-3">
              Recent Notifications
            </Title>

            <div className="space-y-4">
              {recentNotifications.map(notification => (
                <div
                  key={notification.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <h4 className="font-medium text-slate-900 text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    To: {notification.recipients}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {notification.sentAt}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" className="mt-6">
            <Title order={4} className="text-slate-900 mb-3">
              Quick Stats
            </Title>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Sent Today</span>
                <span className="font-semibold text-slate-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Sent This Week</span>
                <span className="font-semibold text-slate-900">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  Total Recipients
                </span>
                <span className="font-semibold text-slate-900">540</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
