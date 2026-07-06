-- Auth hardening primitives: email verification, lockout, and hashed reset tokens.
ALTER TABLE `User`
    ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `failedLoginAttempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `lockedUntil` DATETIME(3) NULL;

ALTER TABLE `PasswordReset`
    ADD COLUMN `tokenHash` VARCHAR(191) NULL,
    ADD COLUMN `usedAt` DATETIME(3) NULL;

CREATE UNIQUE INDEX `PasswordReset_tokenHash_key` ON `PasswordReset`(`tokenHash`);

CREATE TABLE `EmailVerification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EmailVerification_tokenHash_key`(`tokenHash`),
    INDEX `EmailVerification_userId_idx`(`userId`),
    INDEX `EmailVerification_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `EmailVerification`
    ADD CONSTRAINT `EmailVerification_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
