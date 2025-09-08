import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  action: text("action").notNull(), // 'compress', 'convert', 'trim', 'extract', 'watermark'
  options: jsonb("options").notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  progress: integer("progress").notNull().default(0),
  outputPath: text("output_path"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at").notNull().default(sql`now() + interval '24 hours'`),
});

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

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

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

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Processing options schemas
export const compressionOptionsSchema = z.object({
  quality: z.enum(['high', 'medium', 'low']).default('medium'),
});

export const conversionOptionsSchema = z.object({
  format: z.enum(['mp4', 'avi', 'mov', 'gif']).default('mp4'),
});

export const trimOptionsSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
});

export const extractOptionsSchema = z.object({
  format: z.enum(['mp3', 'wav']).default('mp3'),
});

export const watermarkOptionsSchema = z.object({
  text: z.string().optional(),
  position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right']).default('bottom-right'),
  logoPath: z.string().optional(),
});

export type CompressionOptions = z.infer<typeof compressionOptionsSchema>;
export type ConversionOptions = z.infer<typeof conversionOptionsSchema>;
export type TrimOptions = z.infer<typeof trimOptionsSchema>;
export type ExtractOptions = z.infer<typeof extractOptionsSchema>;
export type WatermarkOptions = z.infer<typeof watermarkOptionsSchema>;
