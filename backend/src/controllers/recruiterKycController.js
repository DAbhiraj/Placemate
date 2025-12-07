import { recruiterKycService } from "../services/recruiterKycService.js";

export const recruiterKycController = {
    async submitKyc(req, res) {
        try {
            const { recruiterId } = req.params;
            const kycData = req.body;

            if (!recruiterId) {
                return res.status(400).json({ message: "Recruiter ID is required" });
            }

            const kyc = await recruiterKycService.submitKyc(recruiterId, kycData);
            res.status(201).json({
                message: "KYC submitted successfully",
                kyc
            });
        } catch (error) {
            console.error("Error submitting KYC:", error);
            res.status(500).json({ message: error.message || "Failed to submit KYC" });
        }
    },

    async getKyc(req, res) {
        try {
            const { recruiterId } = req.params;

            if (!recruiterId) {
                return res.status(400).json({ message: "Recruiter ID is required" });
            }

            const kyc = await recruiterKycService.getRecruiterKyc(recruiterId);
            res.status(200).json(kyc || null);
        } catch (error) {
            console.error("Error fetching KYC:", error);
            res.status(500).json({ message: "Failed to fetch KYC" });
        }
    },

    async getPendingKyc(req, res) {
        try {
            const pendingKyc = await recruiterKycService.getPendingKyc();
            res.status(200).json(pendingKyc);
        } catch (error) {
            console.error("Error fetching pending KYC:", error);
            res.status(500).json({ message: "Failed to fetch pending KYC" });
        }
    },

    async approveKyc(req, res) {
        try {
            const { kycId } = req.params;
            const { recruiterId } = req.body;

            if (!kycId || !recruiterId) {
                return res.status(400).json({ message: "KYC ID and Recruiter ID are required" });
            }

            const kyc = await recruiterKycService.approveKyc(kycId, recruiterId);
            res.status(200).json({
                message: "KYC approved successfully",
                kyc
            });
        } catch (error) {
            console.error("Error approving KYC:", error);
            res.status(500).json({ message: "Failed to approve KYC" });
        }
    },

    async rejectKyc(req, res) {
        try {
            const { kycId } = req.params;
            const { rejectionReason } = req.body;

            if (!kycId) {
                return res.status(400).json({ message: "KYC ID is required" });
            }

            const kyc = await recruiterKycService.rejectKyc(kycId, rejectionReason);
            res.status(200).json({
                message: "KYC rejected",
                kyc
            });
        } catch (error) {
            console.error("Error rejecting KYC:", error);
            res.status(500).json({ message: "Failed to reject KYC" });
        }
    }
};
