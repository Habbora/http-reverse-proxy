CREATE TABLE `proxy_routes_table` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`port` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `proxy_routes_table_name_unique` ON `proxy_routes_table` (`name`);