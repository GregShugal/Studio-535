CREATE TABLE `project_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`sender_open_id` varchar(64) NOT NULL,
	`sender_name` varchar(255) NOT NULL,
	`sender_role` enum('admin','user') NOT NULL,
	`message` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `project_messages` ADD CONSTRAINT `project_messages_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;