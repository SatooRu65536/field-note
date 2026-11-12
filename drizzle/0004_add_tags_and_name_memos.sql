CREATE TABLE `name_memos` (
	`name_key` text PRIMARY KEY NOT NULL,
	`memo` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `record_tags` (
	`record_id` text NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`record_id`, `tag`),
	FOREIGN KEY (`record_id`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `record_tags_tag_index` ON `record_tags` (`tag`);