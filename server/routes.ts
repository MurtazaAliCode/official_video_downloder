import { Router, type Application } from "express";
import { type Request, Response } from "express";
import fs from 'fs/promises';  // NEW: For file delete
import { storage } from "./storage.js";
import { addDownloadJob } from './job-queue';
import { InsertJob } from "@shared/types"; // Updated to use alias
import { insertJobSchema } from "@shared/backend-schema"; // Updated to use alias
import { log } from "./vite.js";

// Setup Express Router
export const router = Router();

// Middleware for CORS (optional, uncomment if needed)
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Adjust origin as per your frontend URL
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Endpoint: Start download process
router.post("/download-video", async (req: Request, res: Response) => {
  const { url, format: downloadFormat, quality = '720p', platform } = req.body;

  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    // Validate incoming data
    const validatedData = insertJobSchema.parse({
      url,
      downloadFormat: downloadFormat || 'mp4',
      quality,
      platform: platform || 'youtube',
    });

    const insertJob: InsertJob = validatedData;

    const job = await storage.createJob(insertJob);

    // Queue mein add karo (simple queue auto-process karegi)
    await addDownloadJob({
      id: job.id,
      url: job.url,
      downloadFormat: job.downloadFormat,
      quality: job.quality,
    });

    // Client ko response dein
    return res.status(202).json({
      jobId: job.id,
      message: 'Download job created successfully.',
      status: job.status,
    });
  } catch (error) {
    console.error("🚨 Download request initiation error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    return res.status(400).json({
      message: "Failed to process download request.",
      error: errorMessage,
    });
  }
});

// Endpoint: Check job status (Client polling)
router.get("/status/:jobId", async (req: Request, res: Response) => {
  const { jobId } = req.params;

  try {
    const job = await storage.getJob(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Security: Important fields wapas bhejen
    return res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      downloadUrl: job.downloadUrl,
      title: job.title,
      errorMessage: job.errorMessage,
    });
  } catch (error) {
    console.error(`Error fetching status for ${jobId}:`, error);
    return res.status(500).json({ message: "Error fetching status." });
  }
});

// Endpoint: Serve the final file
router.get("/download/:jobId", async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = await storage.getJob(jobId);

  if (!job || job.status !== 'completed' || !job.outputPath) {
    return res.status(404).json({ message: "File not ready or job expired." });
  }

  try {
    // NEW: Check if file exists before serving
    await fs.access(job.outputPath).catch((err) => {
      throw new Error(`File not found at ${job.outputPath}: ${err.message}`);
    });

    // File ko client ko bhejen
    res.download(job.outputPath, `${job.title || 'video'}.${job.downloadFormat}`, async (err) => {
      if (err) {
        console.error(`Error serving file for ${jobId}:`, err);
        res.status(500).send("Could not download the file.");
      } else {
        // NEW: File serve hone ke baad server se auto-delete karo (storage aur file)
        console.log(`File downloaded by user, deleting from server: ${job.outputPath}`);
        await fs.unlink(job.outputPath).catch((err) =>
          console.error(`Failed to delete file: ${job.outputPath}`, err)
        ); // Delete file
        await storage.deleteJob(jobId); // Delete job from storage
        console.log(`Cleaned up job ${jobId} from storage and downloads folder`);
      }
    });
  } catch (error) {
    console.error(`Unexpected error in download endpoint for ${jobId}:`, error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Endpoint: Handle contact form submission
router.post("/contact", async (req: Request, res: Response) => {
  try {
    const validatedData = insertContactMessageSchema.parse(req.body);
    // Here you can save to database or storage
    res.status(200).json({ message: "Contact saved", data: validatedData });
  } catch (error) {
    res.status(400).json({ message: "Validation error", error: error.message });
  }
});

export const registerRoutes = (app: Application) => {
  app.use('/api', router);
  return app;
};