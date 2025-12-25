import { useEffect, useState } from "react"
// Removed all @/components/ui/* imports
import { Search, Eye, Check, X, FileText, Building2 } from "lucide-react"
import axiosClient from "@/api/axiosClient"

export default function RecruiterVerification() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecruiter, setSelectedRecruiter] = useState(null)
  const [activeTab, setActiveTab] = useState("pending")
  const [recruiters, setRecruiters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get("/admin/recruiter-kyc/pending")
        const recruitersData = response.data.data || response.data
        setRecruiters(recruitersData)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch recruiters:", error)
        setRecruiters([])
        setLoading(false)
      }
    }

    fetchRecruiters()
  }, [])

  const handleVerify = async id => {
    try {
      await axiosClient.post(`/admin/recruiters/${id}/verify`)
      setRecruiters(
        recruiters.map(r => (r.id === id ? { ...r, status: "verified" } : r))
      )
      setSelectedRecruiter(null)
    } catch (error) {
      console.error("Failed to verify recruiter:", error)
    }
  }

  const handleReject = async id => {
    try {
      await axiosClient.post(`/admin/recruiters/${id}/reject`)
      setRecruiters(
        recruiters.map(r => (r.id === id ? { ...r, status: "rejected" } : r))
      )
      setSelectedRecruiter(null)
    } catch (error) {
      console.error("Failed to reject recruiter:", error)
    }
  }

  const filteredRecruiters = recruiters
    .filter(r => r.status === activeTab)
    .filter(
      r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Recruiter Verification
        </h1>
        <p className="text-slate-600 mt-1">
          Review and verify recruiter applications
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search recruiters..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-200">
          <TabsTrigger value="pending" className="data-[state=active]:bg-white">
            Pending ({recruiters.filter(r => r.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger
            value="verified"
            className="data-[state=active]:bg-white"
          >
            Verified ({recruiters.filter(r => r.status === "verified").length})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-white"
          >
            Rejected ({recruiters.filter(r => r.status === "rejected").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecruiters.map(recruiter => (
              <Card
                key={recruiter.id}
                className="bg-white border-slate-200 hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-slate-900">
                        {recruiter.name}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {recruiter.designation}
                      </p>
                    </div>
                    <Badge
                      variant={
                        recruiter.status === "verified"
                          ? "default"
                          : recruiter.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                      className={
                        recruiter.status === "pending" ? "bg-orange-500" : ""
                      }
                    >
                      {recruiter.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Company:</span>
                      <span className="ml-2 font-medium text-slate-900">
                        {recruiter.company}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Email:</span>
                      <span className="ml-2 text-slate-900">
                        {recruiter.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">PAN:</span>
                      <span className="ml-2 font-medium text-slate-900">
                        {recruiter.panNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Applied:</span>
                      <span className="ml-2 text-slate-900">
                        {recruiter.appliedDate}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => setSelectedRecruiter(recruiter)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecruiters.length === 0 && (
            <Card className="bg-white border-slate-200">
              <CardContent className="p-12 text-center">
                <p className="text-slate-500">No recruiters found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selectedRecruiter}
        onOpenChange={() => setSelectedRecruiter(null)}
      >
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              Recruiter Details
            </DialogTitle>
          </DialogHeader>
          {selectedRecruiter && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Full Name
                  </label>
                  <p className="mt-1 text-slate-900">
                    {selectedRecruiter.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Designation
                  </label>
                  <p className="mt-1 text-slate-900">
                    {selectedRecruiter.designation}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Company
                  </label>
                  <p className="mt-1 text-slate-900">
                    {selectedRecruiter.company}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Email
                  </label>
                  <p className="mt-1 text-slate-900">
                    {selectedRecruiter.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Phone
                  </label>
                  <p className="mt-1 text-slate-900">
                    {selectedRecruiter.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    PAN Number
                  </label>
                  <p className="mt-1 font-mono text-slate-900">
                    {selectedRecruiter.panNumber}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-2 block">
                  Documents
                </label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href={selectedRecruiter.documents.pan}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View PAN Card
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a
                      href={selectedRecruiter.documents.id}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View ID Proof
                    </a>
                  </Button>
                </div>
              </div>

              {selectedRecruiter.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleVerify(selectedRecruiter.id)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Verify Recruiter
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedRecruiter.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
