CREATE TABLE `message_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message_id` int NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_url` varchar(500) NOT NULL,
	`file_type` varchar(100),
	`file_size` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`base_price` int NOT NULL,
	`labor_hours` int DEFAULT 0,
	`hourly_rate` int DEFAULT 0,
	`material_cost` int DEFAULT 0,
	`markup_percentage` int DEFAULT 0,
	`notes` text,
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quote_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `message_attachments` ADD CONSTRAINT `message_attachments_message_id_project_messages_id_fk` FOREIGN KEY (`message_id`) REFERENCES `project_messages`(`id`) ON DELETE cascade ON UPDATE no action;