CREATE TABLE `generated_files` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`path` text NOT NULL,
	`content` text NOT NULL,
	`language` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workspaces_slug_unique` ON `workspaces` (`slug`);