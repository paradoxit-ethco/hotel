CREATE TABLE `amenities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hotelId` int NOT NULL,
	`titleEn` varchar(120) NOT NULL,
	`titleAm` varchar(120) NOT NULL,
	`descriptionEn` text,
	`descriptionAm` text,
	`icon` varchar(48),
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `amenities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scope` enum('landing','room','amenity','promotion','navigation') NOT NULL,
	`contentKey` varchar(120) NOT NULL,
	`valueEn` text NOT NULL,
	`valueAm` text NOT NULL,
	`isPublished` boolean NOT NULL DEFAULT true,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `contentEntries_contentKey_unique` UNIQUE(`contentKey`)
);
--> statement-breakpoint
CREATE TABLE `guestProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phone` varchar(48),
	`nationality` varchar(80),
	`language` enum('en','am') NOT NULL DEFAULT 'en',
	`specialNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guestProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `guestProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `hotels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameEn` varchar(160) NOT NULL,
	`nameAm` varchar(160) NOT NULL,
	`cityEn` varchar(120) NOT NULL,
	`cityAm` varchar(120) NOT NULL,
	`addressEn` text,
	`addressAm` text,
	`coverImage` text,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservationId` int NOT NULL,
	`amount` int NOT NULL,
	`method` enum('cash','card','bank','mobile_money') NOT NULL DEFAULT 'card',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hotelId` int NOT NULL,
	`titleEn` varchar(160) NOT NULL,
	`titleAm` varchar(160) NOT NULL,
	`bodyEn` text,
	`bodyAm` text,
	`ctaEn` varchar(80),
	`ctaAm` varchar(80),
	`isActive` boolean NOT NULL DEFAULT true,
	`startsAt` timestamp,
	`endsAt` timestamp,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(40) NOT NULL,
	`hotelId` int NOT NULL,
	`roomId` int NOT NULL,
	`guestId` int NOT NULL,
	`checkIn` timestamp NOT NULL,
	`checkOut` timestamp NOT NULL,
	`guests` int NOT NULL DEFAULT 1,
	`totalAmount` int NOT NULL,
	`status` enum('pending','confirmed','checked_in','checked_out','cancelled') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('unpaid','partial','paid','refunded') NOT NULL DEFAULT 'unpaid',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`),
	CONSTRAINT `reservations_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hotelId` int NOT NULL,
	`code` varchar(24) NOT NULL,
	`nameEn` varchar(160) NOT NULL,
	`nameAm` varchar(160) NOT NULL,
	`descriptionEn` text,
	`descriptionAm` text,
	`type` enum('standard','deluxe','suite','family') NOT NULL DEFAULT 'standard',
	`status` enum('available','occupied','cleaning','maintenance','reserved') NOT NULL DEFAULT 'available',
	`capacity` int NOT NULL DEFAULT 2,
	`bedType` varchar(80) DEFAULT 'King bed',
	`priceNight` int NOT NULL,
	`imageUrl` text,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `rooms_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','guest','admin','developer') NOT NULL DEFAULT 'guest';