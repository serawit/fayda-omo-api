import cron from 'node-cron';
import User from '../models/user.model.js';
import { FaydaSyncService } from './faydaSync.service.js';

export const initCronJobs = () => {
  console.log('⏰ Initializing Cron Jobs...');

  // Schedule: Daily at 2:00 AM
  // Cron format: Minute Hour DayMonth Month DayWeek
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 [Cron] Starting Daily Fayda Sync...');
    
    try {
      // Find users with a linked Fayda ID who are not flagged/rejected
      // Using a cursor to handle large datasets efficiently
      const cursor = User.find({ 
        faydaId: { $exists: true, $ne: null },
        reviewStatus: { $nin: ['FLAGGED', 'REJECTED'] } 
      }).cursor();

      let successCount = 0;
      let failCount = 0;

      // Iterate asynchronously through the stream
      for await (const user of cursor) {
        try {
          if (user.faydaId) {
            // Add a small delay (200ms) to be gentle on the Fayda API and prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const result = await FaydaSyncService.syncCustomer(user.faydaId, user.id);
            
            if (result.success) {
              successCount++;
            } else {
              failCount++;
            }
          }
        } catch (err) {
          console.error(`❌ [Cron] Error syncing user ${user.id}:`, err);
          failCount++;
        }
      }

      console.log(`✅ [Cron] Daily Sync Completed. Success: ${successCount}, Failed: ${failCount}`);
    } catch (err) {
      console.error('🔥 [Cron] Fatal error in daily sync job:', err);
    }
  });
};