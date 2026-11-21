CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text,
	`emoji` text
);
--> statement-breakpoint
ALTER TABLE `products` ADD `emoji` text;--> statement-breakpoint
ALTER TABLE `products` ADD `bg_color` text;--> statement-breakpoint
ALTER TABLE `products` ADD `category` integer REFERENCES categories(id);