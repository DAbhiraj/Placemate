import { recruiterKycService } from "../services/recruiterKycService.js";
import { keycloakService } from "../services/keycloakService.js";

const ACCESS_TOKEN_COOKIE = "pm_access_token";

export const recruiterKycController = {
    async submitKyc(req, res) {
        try {
            // Extract recruiterId from auth cookie (Keycloak ID is used as user_id in database)
            const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
            if (!accessToken) {
                return res.status(401).json({ message: "Not authenticated" });
            }

            const recruiterId = keycloakService.decodeUserId(accessToken);
            if (!recruiterId) {
                return res.status(401).json({ message: "Invalid authentication token" });
            }

            const kycData = req.body;

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
            // Extract recruiterId from auth cookie (Keycloak ID is used as user_id in database)
            const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
            if (!accessToken) {
                return res.status(401).json({ message: "Not authenticated" });
            }

            const recruiterId = keycloakService.decodeUserId(accessToken);
            if (!recruiterId) {
                return res.status(401).json({ message: "Invalid authentication token" });
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
