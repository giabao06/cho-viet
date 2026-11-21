ALTER TABLE `categories` ADD `alias` text;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text,
	`emoji` text,
	`bg_color` text,
	`category` integer,
	`price` integer,
	`old_price` integer,
	`sold` integer,
	`percentage` integer,
	`desc` text,
	`sold_out` boolean,
	CONSTRAINT `fk_products_category_categories_id_fk` FOREIGN KEY (`category`) REFERENCES `categories`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_products`(`id`, `name`, `emoji`, `bg_color`, `category`, `price`, `old_price`, `sold`, `percentage`, `desc`, `sold_out`) SELECT `id`, `name`, `emoji`, `bg_color`, `category`, `price`, `old_price`, `sold`, `percentage`, `desc`, `sold_out` FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
PRAGMA foreign_keys=ON;