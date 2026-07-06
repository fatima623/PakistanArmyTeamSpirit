-- CreateTable
CREATE TABLE `TickerAnnouncement` (
    `id` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `shortLabel` VARCHAR(191) NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'NORMAL',
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `visibility` VARCHAR(191) NOT NULL DEFAULT 'HOMEPAGE',
    `isUrgent` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TickerAnnouncement_status_idx`(`status`),
    INDEX `TickerAnnouncement_visibility_idx`(`visibility`),
    INDEX `TickerAnnouncement_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
