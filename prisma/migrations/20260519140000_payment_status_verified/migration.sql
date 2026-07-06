-- Normalize legacy payment status values to clearer terminology
UPDATE `User` SET `paymentStatus` = 'VERIFIED' WHERE `paymentStatus` = 'APPROVED';
UPDATE `Payment` SET `status` = 'VERIFIED' WHERE `status` = 'APPROVED';
UPDATE `User` SET `paymentStatus` = 'SUBMITTED' WHERE `paymentStatus` = 'UNDER_REVIEW';
UPDATE `Payment` SET `status` = 'SUBMITTED' WHERE `status` = 'UNDER_REVIEW';
