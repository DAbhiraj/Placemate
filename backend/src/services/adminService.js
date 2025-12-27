import { adminRepository } from "../repo/adminRepo.js";
import { spocRepository } from "../repo/spocRepo.js";
import { notificationService } from "./notificationService.js";
//import { statsService } from "./statsService.js";

export const adminService = {
    // Dashboard Stats
    async getDashboardStats() {
        const totalStudents = await adminRepository.getTotalStudents();
        const totalCompanies = await adminRepository.getTotalCompanies();
        const totalApplications = await adminRepository.getTotalApplications();
        const totalPlacements = await adminRepository.getTotalPlacements();
        const avgPackage = await adminRepository.getAveragePackage();
        const placementsByBranch = await adminRepository.getPlacementsByBranch(); 
        return {
            totalStudents,
            totalCompanies,
            totalApplications,
            totalPlacements,
            avgPackage,
            placementsByBranch
        };
    },
    // Company Management
    async createCompany(companyData) {
        const { name, logo, package_range, location, eligible_branches, min_cgpa, deadline, job_type, description, requirements } = companyData;
        return await adminRepository.createCompany(
            name, logo, package_range, location, eligible_branches, min_cgpa, deadline, job_type, description, requirements
        );
    },

    async getAllCompanies() {
        return await adminRepository.getAllCompanies();
    },

    async updateCompany(companyId, updateData) {
        return await adminRepository.updateCompany(companyId, updateData);
    },

    async deleteCompany(companyId) {
        return await adminRepository.deleteCompany(companyId);
    },

    // Job Management
    

    async updateApplicationStatus(applicationId, status) {
        const result = await adminRepository.updateApplicationStatus(applicationId, status);

        // Send notification to student
        const application = await adminRepository.getApplicationById(applicationId);
        if (application) {
            await notificationService.notifyStudent(
                application.user_id, // student_id
                `Your application status has been updated to: ${status}`,
                `APPLICATION_STATUS_${status.toUpperCase()}`
            );
        }

        return result;
    },

    async updateBulkApplicationStatus(jobId, status, studentIds) {
        const results = [];

        for (const studentId of studentIds) {
            const application = await adminRepository.getApplicationByStudentAndJob(studentId, jobId);
            if (application) {
                const result = await adminRepository.updateApplicationStatus(application.id, status);
                results.push(result);

                // Send notification to student
                await notificationService.notifyStudent(
                    studentId,
                    `Your application status has been updated to: ${status}`,
                    `APPLICATION_STATUS_${status.toUpperCase()}`
                );
            }
        }

        return results;
    },

    // Dashboard Stats
    async getDashboardStats() {
        const stats = await adminRepository.getDashboardStats();
        return stats;
    },

    // Student Management
    async getAllStudents() {
        return await adminRepository.getAllStudents();
    },

    async getAllSpocs() {
        return await adminRepository.getAllSpocs();
    },

    async searchUsers(query) {
        return await adminRepository.searchUsers(query);
    },

    async addSpoc(userId) {
        const spoc = await adminRepository.addSpoc(userId);

        // Send notification to the newly assigned SPOC
        await notificationService.notifyUser(
            userId,
            'You have been assigned as a Placement Coordinator (SPOC). You can now access the SPOC portal and manage job assignments.',
            'SPOC_ASSIGNED',
            'You are now a Placement Coordinator'
        );

        return spoc;
    },

    async removeSpoc(spocId) {
        await spocRepository.removeAssignmentsBySpocId(spocId);
        return await adminRepository.removeSpoc(spocId);
    },

    async getSpocAssignedJobs(spocId) {
        return await spocRepository.getAssignedJobsBySpocId(spocId);
    },

    async removeSpocAssignment(spocId, jobId) {
        return await spocRepository.removeAssignment(spocId, jobId);
    },

    async updateStudentStatus(studentId, status) {
        return await adminRepository.updateStudentStatus(studentId, status);
    },

    // Notification Management
    async getStudentIdsByEmails(emails) {
        return await adminRepository.getStudentIdsByEmails(emails);
    },

    async updateApplicationStatusesByCompany(companyName, status, studentIds) {
        return await adminRepository.updateApplicationStatusesByCompany(companyName, status, studentIds);
    }
};
