CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user` text,
	`items` text,
	`total` integer,
	`status` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text,
	`price` integer
);
--> statement-breakpoint
CREATE TABLE `vouchers` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`code` text,
	`discount` real,
	`max_uses` integer,
	`notes` text
);
