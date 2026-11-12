CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`sort_order` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `record_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`record_id`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `record_photos_record_id_index` ON `record_photos` (`record_id`);--> statement-breakpoint
CREATE TABLE `record_tags` (
	`record_id` text NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`record_id`, `tag`),
	FOREIGN KEY (`record_id`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `record_tags_tag_index` ON `record_tags` (`tag`);--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`category_id` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`discovered_at` integer NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `records_location_index` ON `records` (`latitude`,`longitude`);