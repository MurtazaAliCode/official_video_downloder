import { stat } from 'fs/promises';
import path from 'path';
import { storage } from './storage.js';
import { downloadVideoWithYtDlp } from './utils/videoDownloader';
import { getTitleFromYtDlp } from './yt-dlp-utils';
import { log } from './vite.js';
import fs from 'fs/promises';

interface JobData {
    id: string;
    url: string;
    downloadFormat: string;
    quality: string;
}

interface QueueJob {
    data: JobData;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

class SimpleJobQueue {
    private queue: QueueJob[] = [];
    private isProcessing = false;

    constructor() {
        setInterval(async () => {
            const now = new Date();
            console.log(`Periodic cleanup check at ${now.toISOString()}`);
            const expiredJobs = await storage.getExpiredJobs();
            console.log(`Periodic found ${expiredJobs.length} expired jobs:`, expiredJobs);
            for (const job of expiredJobs) {
                await storage.deleteJob(job.id);
                console.log(`Periodic cleaned up expired job ${job.id} from storage`);
            }
        }, 60 * 1000);
    }

    async add(jobData: JobData): Promise<string> {
        // Validate URL before adding to queue
        if (!jobData.url || typeof jobData.url !== 'string' || !jobData.url.match(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/)) {
            console.error('Invalid job URL:', jobData.url);
            throw new Error('Invalid or missing URL in job');
        }

        const job: QueueJob = {
            data: jobData,
            status: 'pending',
        };
        this.queue.push(job);
        console.log(`Added job to queue: ${jobData.id} in ${jobData.quality}`);

        if (!this.isProcessing) {
            this.processNext();
        }

        return jobData.id;
    }

    private async processNext() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const queueJob = this.queue.shift()!;
        const { id: jobId, url, downloadFormat, quality = '720p' } = queueJob.data;
        queueJob.status = 'processing';

        console.log(`Processing job from queue: ${jobId} in ${quality}`);

        try {
            // Validate URL again (safety)
            if (!url || typeof url !== 'string' || !url.match(/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/)) {
                throw new Error(`Invalid URL for job ${jobId}: ${url}`);
            }

            // Update storage to 'processing'
            await storage.updateJobStatus(jobId, 'processing', 5);

            // 1. Title fetch
            console.log(`🔍 Fetching title for ${jobId}...`);
            const title = await getTitleFromYtDlp(url);
            if (!title) {
                throw new Error(`Failed to fetch title for ${url}`);
            }
            await storage.updateJobStatus(jobId, 'processing', 10);
            log(`Job ${jobId}: Title fetched: ${title}`);

            // 2. Download
            console.log(`⬇️ Starting download for ${jobId} in ${quality} at ${new Date().toISOString()}...`);
            const outputPath = path.join(process.cwd(), 'downloads', `${jobId}.${downloadFormat}`);
            const startTime = Date.now();
            const result = await downloadVideoWithYtDlp(url, outputPath, downloadFormat, quality, (progress) => {
                console.log(`📊 Progress for ${jobId}: ${progress}% at ${new Date().toISOString()}`);
                if (progress % 10 === 0) {
                    storage.updateJobStatus(jobId, 'processing', 10 + Math.floor(progress * 0.8)).catch(err => console.error('Progress update error:', err));
                }
            });
            const endTime = Date.now();
            console.log(`⬇️ Download completed for ${jobId} in ${((endTime - startTime) / 1000)} seconds`);

            if (!result.success) {
                throw new Error(result.error || 'Download failed');
            }

            // Confirm file exists
            await fs.access(outputPath).catch(err => {
                throw new Error(`File not found at ${outputPath} after download: ${err.message}`);
            });

            // 3. Finalize
            console.log(`🏁 Finalizing ${jobId}...`);
            const stats = await stat(outputPath);
            const downloadUrl = `/api/download/${jobId}`;

            await storage.updateJobOutput(jobId, outputPath);
            await storage.updateJobDownloadUrl(jobId, downloadUrl);
            await storage.updateJobStatus(jobId, 'completed', 100);

            log(`Job ${jobId} completed. File size: ${stats.size} bytes`);
            queueJob.status = 'completed';

        } catch (error) {
            console.error(`💥 Failed job ${jobId}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await storage.updateJobError(jobId, errorMessage);
            queueJob.status = 'failed';
        } finally {
            this.isProcessing = false;
            this.processNext();

            const now = new Date();
            console.log(`Cleanup check at ${now.toISOString()} for job ${jobId}`);
            const expiredJobs = await storage.getExpiredJobs();
            console.log(`Found ${expiredJobs.length} expired jobs:`, expiredJobs);
            for (const job of expiredJobs) {
                console.log(`Processing expired job ${job.id}, expiresAt: ${job.expiresAt}, now: ${now}`);
                await storage.deleteJob(job.id);
                console.log(`Cleaned up expired job ${job.id} from storage`);
            }
        }
    }

    getQueueLength(): number {
        return this.queue.length;
    }
}

export const jobQueue = new SimpleJobQueue();

export const addDownloadJob = async (jobData: JobData): Promise<string> => {
    console.log('Adding job to simple queue:', jobData.id, `in ${jobData.quality}`);
    return await jobQueue.add(jobData);
};

console.log('Simple in-memory job queue with full processing initialized! (No circular imports)');