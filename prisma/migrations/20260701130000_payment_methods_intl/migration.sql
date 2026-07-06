-- International payment methods: add Wise, mobile-wallet and Remitly fields.
-- Additive / non-destructive: the legacy EasyPaisa & JazzCash columns are kept
-- (they are simply no longer surfaced in the UI), so this migration is safe to
-- apply to an existing database with no data loss.
ALTER TABLE `SiteSettings`
  ADD COLUMN `paymentWiseEmail` VARCHAR(191) NOT NULL DEFAULT 'payments@pats.gov.pk',
  ADD COLUMN `paymentWiseName` VARCHAR(191) NOT NULL DEFAULT 'PATS Organising Committee',
  ADD COLUMN `paymentMobileNumber` VARCHAR(191) NOT NULL DEFAULT '+92 300 1234567',
  ADD COLUMN `paymentMobileTitle` VARCHAR(191) NOT NULL DEFAULT 'PATS',
  ADD COLUMN `paymentRemitlyEmail` VARCHAR(191) NOT NULL DEFAULT 'payments@pats.gov.pk',
  ADD COLUMN `paymentRemitlyName` VARCHAR(191) NOT NULL DEFAULT 'PATS Organising Committee';
