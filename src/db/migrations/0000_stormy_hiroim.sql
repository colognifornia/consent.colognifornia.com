CREATE TABLE `consents` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`services` json,
	`config` json,
	`domain` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`user_agent` varchar(255) NOT NULL,
	`user_ip` varchar(45) NOT NULL,
	`consent_logged_at` datetime NOT NULL DEFAULT now(),
	CONSTRAINT `consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `consents` (`user_id`);--> statement-breakpoint
CREATE INDEX `domain_idx` ON `consents` (`domain`);