PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`alias` text NOT NULL,
	`emoji` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categories`(`id`, `name`, `alias`, `emoji`) SELECT `id`, `name`, `alias`, `emoji` FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`emoji` text NOT NULL,
	`bg_color` text NOT NULL,
	`category` integer NOT NULL,
	`price` integer NOT NULL,
	`old_price` integer NOT NULL,
	`sold` integer NOT NULL,
	`percentage` integer NOT NULL,
	`desc` text NOT NULL,
	`sold_out` boolean NOT NULL,
	CONSTRAINT `fk_products_category_categories_id_fk` FOREIGN KEY (`category`) REFERENCES `categories`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_products`(`id`, `name`, `emoji`, `bg_color`, `category`, `price`, `old_price`, `sold`, `percentage`, `desc`, `sold_out`) SELECT `id`, `name`, `emoji`, `bg_color`, `category`, `price`, `old_price`, `sold`, `percentage`, `desc`, `sold_out` FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
PRAGMA foreign_keys=ON;