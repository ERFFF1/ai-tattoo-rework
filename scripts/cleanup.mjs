// scripts/cleanup.mjs
// Cleanup old blob files (30+ days)
// Run with Vercel Cron: 0 0 * * 0 (weekly)

import { list, del } from '@vercel/blob';

const CUTOFF_DAYS = 30;
const CUTOFF_MS = CUTOFF_DAYS * 24 * 60 * 60 * 1000;

async function cleanupOldBlobs() {
  try {
    console.log(`[Cleanup] Starting cleanup of files older than ${CUTOFF_DAYS} days...`);
    
    const { blobs } = await list();
    const now = Date.now();
    let deletedCount = 0;
    
    for (const blob of blobs) {
      const age = now - new Date(blob.uploadedAt).getTime();
      if (age > CUTOFF_MS) {
        await del(blob.url);
        deletedCount++;
        console.log(`[Cleanup] Deleted: ${blob.pathname} (${Math.round(age / (24 * 60 * 60 * 1000))} days old)`);
      }
    }
    
    console.log(`[Cleanup] Completed. Deleted ${deletedCount} files.`);
  } catch (error) {
    console.error('[Cleanup] Error:', error);
  }
}

cleanupOldBlobs();
