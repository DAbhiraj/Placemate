import { recruiterKycRepository } from "../repo/recruiterKycRepo.js";

export const recruiterKycService = {
    async submitKyc(recruiterId, kycData) {
        // Validate required fields
        if (!kycData.company_name || !kycData.company_address || !kycData.pan_number || !kycData.pan_document_url) {
            throw new Error("Missing required KYC fields");
        }

        const kyc = await recruiterKycRepository.createKyc(recruiterId, kycData);
        return kyc;
    },

    async getRecruiterKyc(recruiterId) {
        return await recruiterKycRepository.getKycByRecruiterId(recruiterId);
    },

    async approveKyc(kycId, recruiterId) {
        const kyc = await recruiterKycRepository.updateKycStatus(kycId, 'approved');
        await recruiterKycRepository.updateRecruiterVerified(recruiterId);
        return kyc;
    },

    async rejectKyc(kycId, rejectionReason) {
        return await recruiterKycRepository.updateKycStatus(kycId, 'rejected', rejectionReason);
    },

    async getPendingKyc() {
        return await recruiterKycRepository.getAllPendingKyc();
    }
};
