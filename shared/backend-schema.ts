import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { downloadOptionsSchema, youtubeOptionsSchema, facebookOptionsSchema, instagramOptionsSchema } from './types'; // Types import

// Jobs table
export const jobs = pgTable("jobs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    url: text("url").notNull(),
    platform: text("platform").notNull(), // 'youtube', 'facebook', 'instagram'
    title: text("title"),
    downloadFormat: text("download_format").notNull().default('mp4'),
    options: jsonb("options").notNull(),
    status: text("status").notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
    progress: integer("progress").notNull().default(0),
    outputPath: text("output_path"),
    downloadUrl: text("download_url"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").notNull().default(sql`now()`),
    completedAt: timestamp("completed_at"),
    expiresAt: timestamp("expires_at").notNull().default(sql`now() + interval '24 hours'`),
});

// Blog Posts table
export const blogPosts = pgTable("blog_posts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    author: text("author").notNull().default('VidDonloader Team'),
    published: boolean("published").notNull().default(true),
    readTime: integer("read_time").notNull(), // in minutes
    createdAt: timestamp("created_at").notNull().default(sql`now()`),
    updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Contact Messages table
export const contactMessages = pgTable("contact_messages", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Zod Schemas
export const insertJobSchema = createInsertSchema(jobs).omit({
    id: true,
    createdAt: true,
    completedAt: true,
    expiresAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
    id: true,
    createdAt: true,
});

// Type exports (for backend use)
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;