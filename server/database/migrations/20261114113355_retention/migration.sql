ALTER TABLE `executions` ADD `archives_purged` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `executions` ADD `bytes_purged` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `executions` ADD `retention_warning` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `retention_max_files` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `retention_max_bytes` integer;