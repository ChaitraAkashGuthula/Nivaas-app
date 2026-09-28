CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`kind` enum('city','locality','landmark') NOT NULL DEFAULT 'locality',
	`city` varchar(120) NOT NULL,
	`state` varchar(120) NOT NULL,
	`latitude` decimal(9,6),
	`longitude` decimal(9,6),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `locations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`description` text,
	`purposeId` int NOT NULL,
	`propertyTypeId` int NOT NULL,
	`price` decimal(14,2) NOT NULL,
	`rentPeriod` varchar(40),
	`deposit` decimal(14,2),
	`bedrooms` int,
	`bathrooms` decimal(4,1),
	`areaSqft` int,
	`furnishing` varchar(60),
	`parking` varchar(60),
	`societyName` varchar(140),
	`locationId` int NOT NULL,
	`latitude` decimal(9,6),
	`longitude` decimal(9,6),
	`locationPrecision` enum('exact','street','locality') NOT NULL DEFAULT 'locality',
	`status` enum('draft','pending_review','published','paused','sold','rented','rejected','archived') NOT NULL DEFAULT 'draft',
	`verificationStatus` enum('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`publishedAt` timestamp,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`),
	CONSTRAINT `properties_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `property_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`url` varchar(700) NOT NULL,
	`altText` varchar(220) NOT NULL,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `property_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`icon` varchar(40),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `property_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `property_types_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `purposes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `purposes_id` PRIMARY KEY(`id`),
	CONSTRAINT `purposes_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `properties` ADD CONSTRAINT `properties_sellerId_users_id_fk` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `properties` ADD CONSTRAINT `properties_purposeId_purposes_id_fk` FOREIGN KEY (`purposeId`) REFERENCES `purposes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `properties` ADD CONSTRAINT `properties_propertyTypeId_property_types_id_fk` FOREIGN KEY (`propertyTypeId`) REFERENCES `property_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `properties` ADD CONSTRAINT `properties_locationId_locations_id_fk` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `property_images` ADD CONSTRAINT `property_images_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `locations_city_idx` ON `locations` (`city`);--> statement-breakpoint
CREATE INDEX `properties_browse_idx` ON `properties` (`status`,`purposeId`,`propertyTypeId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `properties_location_idx` ON `properties` (`locationId`,`status`);--> statement-breakpoint
CREATE INDEX `properties_seller_idx` ON `properties` (`sellerId`,`status`);--> statement-breakpoint
CREATE INDEX `properties_price_idx` ON `properties` (`price`);--> statement-breakpoint
CREATE INDEX `property_images_property_idx` ON `property_images` (`propertyId`,`sortOrder`);