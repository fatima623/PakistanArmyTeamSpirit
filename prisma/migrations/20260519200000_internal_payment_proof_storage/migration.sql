-- Internal private payment proof storage (replaces R2 proofStorageKey)
ALTER TABLE `Payment` ADD COLUMN `internalFilePath` VARCHAR(512) NULL;

UPDATE `Payment` SET `internalFilePath` = `proofStorageKey`
WHERE `proofStorageKey` IS NOT NULL
  AND `proofStorageKey` NOT LIKE 'payments/%';

ALTER TABLE `Payment` DROP INDEX `Payment_proofStorageKey_key`;
ALTER TABLE `Payment` DROP INDEX `Payment_proofStorageKey_idx`;
ALTER TABLE `Payment` DROP COLUMN `proofStorageKey`;
ALTER TABLE `Payment` DROP COLUMN `proofPublicUrl`;

CREATE UNIQUE INDEX `Payment_internalFilePath_key` ON `Payment`(`internalFilePath`);
