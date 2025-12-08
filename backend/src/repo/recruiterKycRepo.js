import { pool } from "../db/db.js";

export const recruiterKycRepository = {
    async createKyc(recruiterId, kycData) {
        const {
            company_name,
            company_website,
            company_address,
            pan_number,
            pan_document_url,
            hr_contact_number,
            linkedin_profile_url,
            years_of_experience
        } = kycData;

        console.log(recruiterId);

        const result = await pool.query(
            `INSERT INTO recruiter_kyc (
                recruiter_id, company_name, company_website, company_address, 
                pan_number, pan_document_url, hr_contact_number, linkedin_profile_url, 
                years_of_experience
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                recruiterId, company_name, company_website, company_address,
                pan_number, pan_document_url, hr_contact_number, linkedin_profile_url,
                years_of_experience
            ]
        );
        return result.rows[0];
    },

    async getKycByRecruiterId(recruiterId) {
        const result = await pool.query(
            `SELECT * FROM recruiter_kyc WHERE recruiter_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [recruiterId]
        );
        return result.rows[0];
    },

    async updateKycStatus(kycId, status, rejectionReason = null) {
        const approvedDate = status === 'approved' ? new Date() : null;
        const result = await pool.query(
            `UPDATE recruiter_kyc 
             SET approval_status = $2, rejection_reason = $3, approved_date = $4, updated_at = CURRENT_TIMESTAMP
             WHERE kyc_id = $1
             RETURNING *`,
            [kycId, status, rejectionReason, approvedDate]
        );
        return result.rows[0];
    },

    async getAllPendingKyc() {
        const result = await pool.query(
            `SELECT rk.*, u.name, u.email, u.company_name 
             FROM recruiter_kyc rk
             JOIN users u ON rk.recruiter_id = u.user_id
             WHERE rk.approval_status = 'pending'
             ORDER BY rk.submission_date ASC`
        );
        return result.rows;
    },

    async updateRecruiterVerified(recruiterId) {
        const result = await pool.query(
            `UPDATE users SET is_verified = true WHERE user_id = $1 RETURNING *`,
            [recruiterId]
        );
        return result.rows[0];
    }
};
