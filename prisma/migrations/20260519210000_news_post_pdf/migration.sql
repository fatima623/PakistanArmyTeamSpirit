-- AlterTable
ALTER TABLE `NewsPost` ADD COLUMN `pdfPath` TEXT;
ALTER TABLE `NewsPost` ADD COLUMN `pdfOriginalName` TEXT;
ALTER TABLE `NewsPost` ADD COLUMN `pdfMimeType` TEXT;
ALTER TABLE `NewsPost` ADD COLUMN `pdfFileSize` INTEGER;
