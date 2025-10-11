import { type Job, type InsertJob, type BlogPost, type InsertBlogPost, type ContactMessage, type InsertContactMessage } from "@shared/schema";
import { randomUUID } from "crypto";

// Extend InsertJob with quality (for in-memory use)
interface InsertJobWithQuality extends InsertJob {
  quality?: string;  // NEW: Quality field (e.g., '720p')
}

// Extend Job with quality (for in-memory use)
interface JobWithQuality extends Job {
  quality?: string;  // NEW: Quality field
}

export interface IStorage {
  // Jobs
  createJob(job: InsertJobWithQuality): Promise<JobWithQuality>;  // NEW: With quality
  getJob(id: string): Promise<JobWithQuality | undefined>;  // NEW: With quality
  updateJobStatus(id: string, status: string, progress?: number): Promise<void>;
  updateJobOutput(id: string, outputPath: string): Promise<void>;
  updateJobDownloadUrl(id: string, downloadUrl: string): Promise<void>;
  updateJobError(id: string, errorMessage: string): Promise<void>;
  getExpiredJobs(): Promise<JobWithQuality[]>;  // NEW: With quality
  deleteJob(id: string): Promise<void>;

  // Blog Posts
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost>;

  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
}

export class MemStorage implements IStorage {
  private jobs: Map<string, JobWithQuality> = new Map();  // NEW: With quality
  private blogPosts: Map<string, BlogPost> = new Map();
  private contactMessages: Map<string, ContactMessage> = new Map();

  constructor() {
    this.seedBlogPosts();
  }

  private seedBlogPosts() {
    const posts: InsertBlogPost[] = [
      // ... (tumhara existing blog posts code yahan paste karo)
    ];

    posts.forEach(post => {
      const id = randomUUID();
      const blogPost: BlogPost = {
        ...post,
        id,
        author: post.author || 'VidDonloader Team',
        published: post.published ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.blogPosts.set(id, blogPost);
    });
  }

  // Job methods
  async createJob(insertJob: InsertJobWithQuality): Promise<JobWithQuality> {  // NEW: With quality
    const id = randomUUID();
    const job: JobWithQuality = {
      ...insertJob,
      id,
      title: null,
      downloadFormat: insertJob.downloadFormat || 'mp4',
      quality: insertJob.quality || '720p',  // NEW: Default 720p if not provided
      status: 'pending',
      progress: 0,
      outputPath: null,
      downloadUrl: null,
      errorMessage: null,
      createdAt: new Date(),
      completedAt: null,
      expiresAt: new Date(Date.now() + 1 * 60 * 1000), // TEMP: 1 minute for testing
    };
    this.jobs.set(id, job);
    console.log(`Created job: ${id} in ${job.quality}, expiresAt: ${job.expiresAt.toISOString()}`);  // NEW: Debug log
    return job;
  }

  async getJob(id: string): Promise<JobWithQuality | undefined> {  // NEW: With quality
    return this.jobs.get(id);
  }

  async updateJobStatus(id: string, status: string, progress?: number): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.status = status;
      if (progress !== undefined) {
        job.progress = progress;
      }
      if (status === 'completed' || status === 'failed') {
        job.completedAt = new Date();
      }
      this.jobs.set(id, job);
    }
  }

  async updateJobOutput(id: string, outputPath: string): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.outputPath = outputPath;
      this.jobs.set(id, job);
    }
  }

  async updateJobDownloadUrl(id: string, downloadUrl: string): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.downloadUrl = downloadUrl;
      this.jobs.set(id, job);
    }
  }

  async updateJobError(id: string, errorMessage: string): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.errorMessage = errorMessage;
      job.status = 'failed';
      job.completedAt = new Date();
      this.jobs.set(id, job);
    }
  }

  async getExpiredJobs(): Promise<JobWithQuality[]> {  // NEW: With quality
    const now = new Date();
    console.log(`Checking expired jobs at ${now.toISOString()}`);  // NEW: Debug log
    const expired = Array.from(this.jobs.values()).filter(job => {
      const isExpired = job.expiresAt < now;
      console.log(`Job ${job.id}: expiresAt ${job.expiresAt.toISOString()} vs now ${now.toISOString()} - Expired: ${isExpired}`);
      return isExpired;
    });
    console.log(`Found ${expired.length} expired jobs:`, expired);
    return expired;
  }

  async deleteJob(id: string): Promise<void> {
    this.jobs.delete(id);
    console.log(`Deleted job: ${id} from storage`);  // NEW: Debug log
  }

  // Blog Post methods
  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.published)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      post => post.slug === slug && post.published
    );
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const post: BlogPost = {
      ...insertPost,
      id,
      author: insertPost.author || 'VidDonloader Team',
      published: insertPost.published ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost> {
    const post = this.blogPosts.get(id);
    if (!post) {
      throw new Error('Blog post not found');
    }
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  // Contact Message methods
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();