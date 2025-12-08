import cron from 'node-cron';
import { spocService } from '../services/spocService.js';

/**
 * Job Status Auto-Update Scheduler
 * Runs daily at midnight to update job statuses based on dates
 */
export const initJobStatusScheduler = () => {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running job status auto-update...');
        try {
            const result = await spocService.autoUpdateJobStatuses();
            console.log('[CRON] Job status auto-update completed:', result);
        } catch (error) {
            console.error('[CRON] Error in job status auto-update:', error);
        }
    });

    // Also run every 6 hours for more frequent updates
    cron.schedule('0 */6 * * *', async () => {
        console.log('[CRON] Running 6-hourly job status auto-update...');
        try {
            const result = await spocService.autoUpdateJobStatuses();
            console.log('[CRON] 6-hourly job status auto-update completed:', result);
        } catch (error) {
            console.error('[CRON] Error in 6-hourly job status auto-update:', error);
        }
    });

    console.log('[CRON] Job status scheduler initialized');
    console.log('[CRON] - Daily update: midnight (00:00)');
    console.log('[CRON] - Frequent update: every 6 hours');
};

export default initJobStatusScheduler;
