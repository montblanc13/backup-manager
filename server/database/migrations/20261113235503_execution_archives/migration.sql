CREATE TABLE `execution_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`execution_id` integer NOT NULL,
	`path` text NOT NULL,
	`size` integer NOT NULL,
	CONSTRAINT `fk_execution_files_execution_id_executions_id_fk` FOREIGN KEY (`execution_id`) REFERENCES `executions`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
ALTER TABLE `executions` ADD `archive_path` text;--> statement-breakpoint
ALTER TABLE `executions` ADD `archive_bytes` integer;--> statement-breakpoint
CREATE INDEX `idx_execution_files_execution` ON `execution_files` (`execution_id`);