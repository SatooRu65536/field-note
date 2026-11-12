-- D1 では PRAGMA foreign_keys=OFF が効かず，records を DROP すると record_photos・record_tags が CASCADE で消えるため，子テーブルを退避して先に削除してから records を作り直す
CREATE TABLE `__backup_record_photos` AS SELECT * FROM `record_photos`;--> statement-breakpoint
CREATE TABLE `__backup_record_tags` AS SELECT * FROM `record_tags`;--> statement-breakpoint
DROP TABLE `record_tags`;--> statement-breakpoint
DROP TABLE `record_photos`;--> statement-breakpoint
CREATE TABLE `__new_records` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`category_id` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`discovered_at` integer NOT NULL,
	`memo` text DEFAULT '' NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`is_discovered` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_records`("id", "name", "category_id", "latitude", "longitude", "discovered_at", "memo", "is_public", "is_discovered", "created_at", "updated_at") SELECT "id", "name", "category_id", "latitude", "longitude", "discovered_at", "memo", "is_public", "is_discovered", "created_at", "updated_at" FROM `records`;--> statement-breakpoint
DROP TABLE `records`;--> statement-breakpoint
ALTER TABLE `__new_records` RENAME TO `records`;--> statement-breakpoint
CREATE INDEX `records_location_index` ON `records` (`latitude`,`longitude`);--> statement-breakpoint
CREATE TABLE `record_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`record_id`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `record_photos`("id", "record_id", "object_key", "content_type", "sort_order", "created_at") SELECT "id", "record_id", "object_key", "content_type", "sort_order", "created_at" FROM `__backup_record_photos`;--> statement-breakpoint
DROP TABLE `__backup_record_photos`;--> statement-breakpoint
CREATE INDEX `record_photos_record_id_index` ON `record_photos` (`record_id`);--> statement-breakpoint
CREATE TABLE `record_tags` (
	`record_id` text NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`record_id`, `tag`),
	FOREIGN KEY (`record_id`) REFERENCES `records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `record_tags`("record_id", "tag") SELECT "record_id", "tag" FROM `__backup_record_tags`;--> statement-breakpoint
DROP TABLE `__backup_record_tags`;--> statement-breakpoint
CREATE INDEX `record_tags_tag_index` ON `record_tags` (`tag`);--> statement-breakpoint
CREATE TABLE `__new_name_memos` (
	`name_key` text PRIMARY KEY NOT NULL,
	`memo` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_name_memos`("name_key", "memo", "updated_at") SELECT "name_key", "memo", "updated_at" FROM `name_memos`;--> statement-breakpoint
DROP TABLE `name_memos`;--> statement-breakpoint
ALTER TABLE `__new_name_memos` RENAME TO `name_memos`;
