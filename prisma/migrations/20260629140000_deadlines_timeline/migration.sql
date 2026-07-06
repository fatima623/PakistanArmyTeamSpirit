-- AlterTable
ALTER TABLE `SiteSettings`
    ADD COLUMN `registrationDeadline` DATETIME(3) NULL,
    ADD COLUMN `paymentDeadline` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `KeyDate` ADD COLUMN `date` DATETIME(3) NULL;
