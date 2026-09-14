import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Workspaces table
export const workspaces = sqliteTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Sessions table
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  title: text('title').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Prompts table
export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at').notNull(),
});

// Generated Files table
export const generatedFiles = sqliteTable('generated_files', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  path: text('path').notNull(),
  content: text('content').notNull(),
  language: text('language').notNull(),
  version: integer('version').notNull().default(1),
  updatedAt: integer('updated_at').notNull(),
});

// Relations
export const workspacesRelations = relations(workspaces, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [sessions.workspaceId],
    references: [workspaces.id],
  }),
  prompts: many(prompts),
  generatedFiles: many(generatedFiles),
}));

export const promptsRelations = relations(prompts, ({ one }) => ({
  session: one(sessions, {
    fields: [prompts.sessionId],
    references: [sessions.id],
  }),
}));

export const generatedFilesRelations = relations(generatedFiles, ({ one }) => ({
  session: one(sessions, {
    fields: [generatedFiles.sessionId],
    references: [sessions.id],
  }),
}));