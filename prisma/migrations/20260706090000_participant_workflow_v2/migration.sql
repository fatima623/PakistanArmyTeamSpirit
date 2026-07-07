-- Participant workflow v2: participation confirmation, team registration window,
-- roster cap + size requests, flight details, host information.

-- User: workflow milestone fields
ALTER TABLE `User`
    ADD COLUMN `participationConfirmedAt` DATETIME(3) NULL,
    ADD COLUMN `participationDeclinedAt` DATETIME(3) NULL,
    ADD COLUMN `teamRegisteredAt` DATETIME(3) NULL,
    ADD COLUMN `rosterCompletedAt` DATETIME(3) NULL,
    ADD COLUMN `maxTeamMembersOverride` INTEGER NULL,
    ADD COLUMN `flightsFinalizedAt` DATETIME(3) NULL;

-- TeamMember: rank column; serviceArm becomes optional with default
ALTER TABLE `TeamMember`
    ADD COLUMN `rank` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `serviceArm` VARCHAR(191) NOT NULL DEFAULT '';

-- SiteSettings: configurable deadlines / windows / host info
ALTER TABLE `SiteSettings`
    ADD COLUMN `participationConfirmDeadline` DATETIME(3) NULL,
    ADD COLUMN `teamRegistrationOpenDate` DATETIME(3) NULL,
    ADD COLUMN `teamRegistrationCloseDate` DATETIME(3) NULL,
    ADD COLUMN `flightDetailsDeadline` DATETIME(3) NULL,
    ADD COLUMN `maxTeamMembers` INTEGER NOT NULL DEFAULT 13,
    ADD COLUMN `hostInfoPublished` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hostInfoContent` TEXT NULL;

-- CreateTable TeamSizeRequest
CREATE TABLE `TeamSizeRequest` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `requestedCount` INTEGER NOT NULL,
    `justification` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `reviewNote` TEXT NULL,
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TeamSizeRequest_userId_idx`(`userId`),
    INDEX `TeamSizeRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable FlightDetail
CREATE TABLE `FlightDetail` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `teamMemberId` VARCHAR(191) NULL,
    `passengerName` VARCHAR(191) NOT NULL,
    `passportNumber` VARCHAR(191) NOT NULL,
    `passportFilePath` VARCHAR(191) NULL,
    `passportFileName` VARCHAR(191) NULL,
    `passportFileSize` INTEGER NULL,
    `passportUploadedAt` DATETIME(3) NULL,
    `ticketFilePath` VARCHAR(191) NULL,
    `ticketFileName` VARCHAR(191) NULL,
    `ticketFileSize` INTEGER NULL,
    `ticketUploadedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FlightDetail_teamMemberId_key`(`teamMemberId`),
    UNIQUE INDEX `FlightDetail_passportFilePath_key`(`passportFilePath`),
    UNIQUE INDEX `FlightDetail_ticketFilePath_key`(`ticketFilePath`),
    INDEX `FlightDetail_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TeamSizeRequest` ADD CONSTRAINT `TeamSizeRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamSizeRequest` ADD CONSTRAINT `TeamSizeRequest_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightDetail` ADD CONSTRAINT `FlightDetail_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightDetail` ADD CONSTRAINT `FlightDetail_teamMemberId_fkey` FOREIGN KEY (`teamMemberId`) REFERENCES `TeamMember`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
