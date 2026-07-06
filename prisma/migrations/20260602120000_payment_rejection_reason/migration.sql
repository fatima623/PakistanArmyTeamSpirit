-- Payment rejection reason shown to participant on portal
ALTER TABLE `Payment` ADD COLUMN `rejectionReason` TEXT NULL;
