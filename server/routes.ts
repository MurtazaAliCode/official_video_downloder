import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import {
  insertJobSchema,
  insertContactMessageSchema,
  compressionOptionsSchema,
  conversionOptionsSchema,
  trimOptionsSchema,
  extractOptionsSchema,
  watermarkOptionsSchema,
  type Job,
} from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/uploads/',
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, AVI, and MOV files are allowed.'));
    }
  }
});

// Simple job queue (would use BullMQ with Redis in production)
class SimpleJobQueue {
  private jobs: Map<string, Job> = new Map();
  private processing: Set<string> = new Set();

  async addJob(job: Job) {
    this.jobs.set(job.id, job);
    // Start processing immediately (in production, would use proper queue)
    this.processJob(job.id);
  }

  private async processJob(jobId: string) {
    if (this.processing.has(jobId)) return;
    
    this.processing.add(jobId);
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      await storage.updateJobStatus(jobId, 'processing', 0);
      
      // Simulate processing with progress updates
      for (let progress = 10; progress <= 90; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await storage.updateJobStatus(jobId, 'processing', progress);
      }

      // Simulate output file creation
      const outputExtension = this.getOutputExtension(job.action, job.options);
      const outputPath = `/tmp/processed/${jobId}${outputExtension}`;
      
      // Create output directory if it doesn't exist
      await fs.mkdir('/tmp/processed', { recursive: true });
      
      // Copy input to output for demo (would use FFmpeg in production)
      await fs.copyFile(job.filePath, outputPath);
      
      await storage.updateJobOutput(jobId, outputPath);
      await storage.updateJobStatus(jobId, 'completed', 100);
      
    } catch (error) {
      await storage.updateJobError(jobId, error instanceof Error ? error.message : 'Processing failed');
    } finally {
      this.processing.delete(jobId);
    }
  }

  private getOutputExtension(action: string, options: any): string {
    switch (action) {
      case 'convert':
        return options.format === 'gif' ? '.gif' : `.${options.format}`;
      case 'extract':
        return options.format === 'wav' ? '.wav' : '.mp3';
      default:
        return '.mp4';
    }
  }
}

const jobQueue = new SimpleJobQueue();

export async function registerRoutes(app: Express): Promise<Server> {
  // File upload endpoint
  app.post('/api/upload', upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      const fileInfo = {
        id: randomUUID(),
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimetype: req.file.mimetype,
      };

      res.json({
        success: true,
        file: fileInfo,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // Job processing endpoint
  app.post('/api/process', async (req, res) => {
    try {
      const { action, filePath, fileName, fileSize, options } = req.body;

      // Validate options based on action
      let validatedOptions;
      switch (action) {
        case 'compress':
          validatedOptions = compressionOptionsSchema.parse(options);
          break;
        case 'convert':
          validatedOptions = conversionOptionsSchema.parse(options);
          break;
        case 'trim':
          validatedOptions = trimOptionsSchema.parse(options);
          break;
        case 'extract':
          validatedOptions = extractOptionsSchema.parse(options);
          break;
        case 'watermark':
          validatedOptions = watermarkOptionsSchema.parse(options);
          break;
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      const job = await storage.createJob({
        fileName,
        filePath,
        fileSize,
        action,
        options: validatedOptions,
      });

      // Add job to queue for processing
      await jobQueue.addJob(job);

      res.json({ success: true, jobId: job.id });
    } catch (error) {
      console.error('Process error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid options', details: error.errors });
      }
      res.status(500).json({ error: 'Processing failed' });
    }
  });

  // Job status endpoint
  app.get('/api/status/:jobId', async (req, res) => {
    try {
      const job = await storage.getJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json({
        id: job.id,
        status: job.status,
        progress: job.progress,
        outputPath: job.outputPath,
        errorMessage: job.errorMessage,
      });
    } catch (error) {
      console.error('Status error:', error);
      res.status(500).json({ error: 'Failed to get status' });
    }
  });

  // File download endpoint
  app.get('/api/download/:jobId', async (req, res) => {
    try {
      const job = await storage.getJob(req.params.jobId);
      if (!job || job.status !== 'completed' || !job.outputPath) {
        return res.status(404).json({ error: 'File not ready for download' });
      }

      // Check if file exists
      try {
        await fs.access(job.outputPath);
      } catch {
        return res.status(404).json({ error: 'File not found' });
      }

      // Set appropriate headers
      const extension = path.extname(job.outputPath);
      const contentType = this.getContentType(extension);
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="processed_${job.fileName}"`);
      
      // Stream the file
      const fileStream = await fs.readFile(job.outputPath);
      res.send(fileStream);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Download failed' });
    }
  });

  // Blog endpoints
  app.get('/api/blog', async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error('Blog posts error:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  });

  app.get('/api/blog/:slug', async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('Blog post error:', error);
      res.status(500).json({ error: 'Failed to fetch blog post' });
    }
  });

  // Contact form endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedMessage = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedMessage);
      res.json({ success: true, id: message.id });
    } catch (error) {
      console.error('Contact error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid form data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Cleanup expired jobs (would be a cron job in production)
  setInterval(async () => {
    try {
      const expiredJobs = await storage.getExpiredJobs();
      for (const job of expiredJobs) {
        // Delete files
        try {
          await fs.unlink(job.filePath);
          if (job.outputPath) {
            await fs.unlink(job.outputPath);
          }
        } catch (error) {
          console.error('File cleanup error:', error);
        }
        // Delete job record
        await storage.deleteJob(job.id);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }, 60 * 60 * 1000); // Run every hour

  const httpServer = createServer(app);
  return httpServer;
}

function getContentType(extension: string): string {
  switch (extension.toLowerCase()) {
    case '.mp4':
      return 'video/mp4';
    case '.avi':
      return 'video/x-msvideo';
    case '.mov':
      return 'video/quicktime';
    case '.mp3':
      return 'audio/mpeg';
    case '.wav':
      return 'audio/wav';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}
