CREATE TABLE IF NOT EXISTS `executions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`task_id` integer NOT NULL,
	`status` text NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text,
	`files_copied` integer DEFAULT 0 NOT NULL,
	`files_skipped` integer DEFAULT 0 NOT NULL,
	`bytes_copied` integer DEFAULT 0 NOT NULL,
	`error` text,
	CONSTRAINT `fk_executions_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`source_path` text NOT NULL,
	`destination_path` text NOT NULL,
	`cron` text NOT NULL,
	`exclusions` text DEFAULT '[]' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_executions_task` ON `executions` (`task_id`,`started_at`);