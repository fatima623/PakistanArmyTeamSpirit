-- User workflow fields
ALTER TABLE `User` ADD COLUMN `applicationStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING';
ALTER TABLE `User` ADD COLUMN `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING';
ALTER TABLE `User` ADD COLUMN `adminNotes` TEXT NULL;
ALTER TABLE `User` ADD COLUMN `rejectionReason` TEXT NULL;
ALTER TABLE `User` ADD COLUMN `rejectedAt` DATETIME(3) NULL;
ALTER TABLE `User` ADD COLUMN `approvedAt` DATETIME(3) NULL;
ALTER TABLE `User` ADD COLUMN `suspended` BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX `User_applicationStatus_idx` ON `User`(`applicationStatus`);
CREATE INDEX `User_paymentStatus_idx` ON `User`(`paymentStatus`);

-- Sync legacy approved flag
UPDATE `User` SET `applicationStatus` = 'APPROVED', `approvedAt` = COALESCE(`approvedAt`, `updatedAt`) WHERE `approved` = true;
UPDATE `User` SET `applicationStatus` = 'PENDING' WHERE `approved` = false AND (`applicationStatus` IS NULL OR `applicationStatus` = '');

-- Payment table
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'GBP',
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `proofFileName` VARCHAR(191) NULL,
    `proofMimeType` VARCHAR(191) NULL,
    `paymentDate` DATETIME(3) NULL,
    `transactionReference` VARCHAR(191) NULL,
    `adminNotes` TEXT NULL,
    `verifiedById` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Payment_userId_idx`(`userId`),
    INDEX `Payment_status_idx`(`status`),
    INDEX `Payment_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Audit log
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `AuditLog_actorId_idx`(`actorId`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- News publish flag
ALTER TABLE `NewsPost` ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT true;

-- Site settings extensions
ALTER TABLE `SiteSettings` ADD COLUMN `merchandiseQrUrl` VARCHAR(191) NOT NULL DEFAULT 'https://www.theprintsofwales.co.uk/cambrian-patrol/';
ALTER TABLE `SiteSettings` ADD COLUMN `photographyQrUrl` VARCHAR(191) NOT NULL DEFAULT 'mailto:igphoto@yahoo.co.uk';
ALTER TABLE `SiteSettings` ADD COLUMN `defaultPaymentAmount` DECIMAL(10, 2) NOT NULL DEFAULT 150.00;

CREATE INDEX `Unit_unitName_idx` ON `Unit`(`unitName`);
