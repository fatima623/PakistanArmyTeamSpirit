-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `rank` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'user',
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `privacyAccepted` BOOLEAN NOT NULL DEFAULT false,
    `privacyAcceptedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Unit` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `unitType` VARCHAR(191) NOT NULL,
    `jointPatrol` BOOLEAN NOT NULL DEFAULT false,
    `branch` VARCHAR(191) NOT NULL,
    `unitName` VARCHAR(191) NOT NULL,
    `bdeOrFmn` VARCHAR(191) NOT NULL,
    `divOrFmn` VARCHAR(191) NOT NULL,
    `arm` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `unitAddress` VARCHAR(191) NOT NULL,
    `postcode` VARCHAR(191) NOT NULL,
    `telephoneMil` VARCHAR(191) NOT NULL,
    `telephoneCiv` VARCHAR(191) NOT NULL,
    `secondPocEmail` VARCHAR(191) NULL,
    `thirdPocEmail` VARCHAR(191) NULL,
    `additionalInfo` TEXT NULL,
    `coName` VARCHAR(191) NOT NULL,
    `coEmail` VARCHAR(191) NOT NULL,
    `coPhone` VARCHAR(191) NOT NULL,
    `coRank` VARCHAR(191) NOT NULL,
    `coSalutations` VARCHAR(191) NULL,
    `preferredPhase` VARCHAR(191) NULL,
    `patrolsRequested` INTEGER NOT NULL DEFAULT 1,
    `canAccommodateIntl` BOOLEAN NOT NULL DEFAULT false,
    `preferredIntlPatrol` VARCHAR(191) NULL,
    `longStandingRelation` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Unit_userId_key`(`userId`),
    INDEX `Unit_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Patrol` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `phase` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Patrol_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NewsPost` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NewsPost_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KeyDate` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Phase` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Phase_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DataEntryPeriod` (
    `id` VARCHAR(191) NOT NULL,
    `openDate` DATETIME(3) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordReset` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordReset_token_key`(`token`),
    INDEX `PasswordReset_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `registrationOpen` BOOLEAN NOT NULL DEFAULT true,
    `intlRegistrationOpen` BOOLEAN NOT NULL DEFAULT true,
    `exerciseYear` INTEGER NOT NULL DEFAULT 2026,
    `exerciseDates` VARCHAR(191) NOT NULL DEFAULT '2 ΓÇô 13 October 2026',
    `privacyPolicyUrl` VARCHAR(191) NOT NULL DEFAULT '/privacy',
    `feeNoticeText` TEXT NOT NULL,
    `approvalNoticeText` TEXT NOT NULL,
    `facebookUrl` VARCHAR(191) NOT NULL DEFAULT '#',
    `twitterUrl` VARCHAR(191) NOT NULL DEFAULT '#',
    `instagramUrl` VARCHAR(191) NOT NULL DEFAULT '#',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Patrol` ADD CONSTRAINT `Patrol_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordReset` ADD CONSTRAINT `PasswordReset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

