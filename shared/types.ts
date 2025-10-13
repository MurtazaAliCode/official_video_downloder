import { z } from "zod";

// Types definitions (no runtime imports like drizzle-orm)
export type Job = {
    id: string;
    url: string;
    platform: string; // 'youtube', 'facebook', 'instagram'
    title: string | null;
    downloadFormat: string;
    options: DownloadOptions;
    status: string; // 'pending', 'processing', 'completed', 'failed'
    progress: number;
    outputPath: string | null;
    downloadUrl: string | null;
    errorMessage: string | null;
    createdAt: string;
    completedAt: string | null;
    expiresAt: string;
};

export type InsertJob = Omit<Job, 'id' | 'createdAt' | 'completedAt' | 'expiresAt'>;

export type BlogPost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    published: boolean;
    readTime: number; // in minutes
    createdAt: string;
    updatedAt: string;
};

export type InsertBlogPost = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>;

export type ContactMessage = {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
};

export type InsertContactMessage = Omit<ContactMessage, 'id' | 'createdAt'>;

// Download options schemas
export const downloadOptionsSchema = z.object({
    quality: z.enum(['highest', 'high', 'medium', 'low']).default('high'),
    format: z.enum(['mp4']).default('mp4'),
});

export const youtubeOptionsSchema = downloadOptionsSchema.extend({
    resolution: z.enum(['1080p', '720p', '480p', '360p']).optional(),
});

export const facebookOptionsSchema = downloadOptionsSchema;

export const instagramOptionsSchema = downloadOptionsSchema;

export type DownloadOptions = z.infer<typeof downloadOptionsSchema>;
export type YoutubeOptions = z.infer<typeof youtubeOptionsSchema>;
export type FacebookOptions = z.infer<typeof facebookOptionsSchema>;
import type InstagramOptions = z.infer<typeof instagramOptionsSchema>;