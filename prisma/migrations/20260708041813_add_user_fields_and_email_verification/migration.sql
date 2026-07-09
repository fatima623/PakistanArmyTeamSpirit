/*
  Warnings:

  - You are about to alter the column `proofOriginalFileName` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `internalFilePath` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `newspost` MODIFY `pdfPath` VARCHAR(191) NULL,
    MODIFY `pdfOriginalName` VARCHAR(191) NULL,
    MODIFY `pdfMimeType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `passwordreset` MODIFY `token` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `payment` MODIFY `currency` VARCHAR(191) NOT NULL DEFAULT 'PKR',
    MODIFY `proofOriginalFileName` VARCHAR(191) NULL,
    MODIFY `internalFilePath` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `sitesettings` MODIFY `exerciseDates` VARCHAR(191) NOT NULL DEFAULT '2 – 13 October 2026',
    MODIFY `paymentBankAccountTitle` VARCHAR(191) NOT NULL DEFAULT 'PATS',
    MODIFY `paymentEasypaisaTitle` VARCHAR(191) NOT NULL DEFAULT 'PATS',
    MODIFY `paymentJazzcashTitle` VARCHAR(191) NOT NULL DEFAULT 'PATS';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `nationality` VARCHAR(191) NULL DEFAULT 'Pakistani';

-- CreateIndex
CREATE INDEX `User_approved_idx` ON `User`(`approved`);
