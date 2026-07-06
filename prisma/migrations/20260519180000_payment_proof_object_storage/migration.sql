-- Payment proof object storage metadata (Cloudflare R2)
ALTER TABLE `Payment` ADD COLUMN `proofStorageKey` VARCHAR(512) NULL;
ALTER TABLE `Payment` ADD COLUMN `proofOriginalFileName` VARCHAR(255) NULL;
ALTER TABLE `Payment` ADD COLUMN `proofFileSize` INTEGER NULL;
ALTER TABLE `Payment` ADD COLUMN `proofUploadedAt` DATETIME(3) NULL;
ALTER TABLE `Payment` ADD COLUMN `proofPublicUrl` VARCHAR(1024) NULL;
ALTER TABLE `Payment` ADD COLUMN `uploaderName` VARCHAR(191) NULL;
ALTER TABLE `Payment` ADD COLUMN `uploaderEmail` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Payment_proofStorageKey_key` ON `Payment`(`proofStorageKey`);
CREATE INDEX `Payment_proofStorageKey_idx` ON `Payment`(`proofStorageKey`);
