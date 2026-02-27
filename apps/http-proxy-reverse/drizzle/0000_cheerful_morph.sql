CREATE TABLE `proxy_routes_table` (
	`id` text PRIMARY KEY NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`proxy_name` text NOT NULL,
	`target_url` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `proxy_routes_table_proxy_name_unique` ON `proxy_routes_table` (`proxy_name`);