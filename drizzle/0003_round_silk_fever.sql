CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`product_id` varchar(100) NOT NULL,
	`product_name` varchar(255) NOT NULL,
	`description` text,
	`quantity` int NOT NULL DEFAULT 1,
	`unit_price` int NOT NULL,
	`total` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_number` varchar(50) NOT NULL,
	`invoice_number` varchar(50) NOT NULL,
	`user_id` int,
	`project_id` int,
	`customer_name` varchar(255) NOT NULL,
	`customer_email` varchar(320) NOT NULL,
	`order_type` enum('product','deposit','balance') NOT NULL,
	`status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`subtotal` int NOT NULL,
	`tax` int NOT NULL DEFAULT 0,
	`total` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`stripe_session_id` varchar(255),
	`stripe_payment_intent_id` varchar(255),
	`invoice_pdf_url` text,
	`invoice_pdf_key` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`paid_at` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`),
	CONSTRAINT `orders_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;