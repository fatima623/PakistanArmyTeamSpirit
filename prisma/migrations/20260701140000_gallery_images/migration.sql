-- Dynamic gallery: admin-managed images rendered on the public /gallery page.
-- Additive / non-destructive: creates a single new table, no existing data is
-- touched. Image binaries live on disk under uploads/gallery/ (served via the
-- /uploads/[...path] route); only metadata is stored here.

-- CreateTable
CREATE TABLE `GalleryImage` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `caption` TEXT NULL,
    `year` INTEGER NULL,
    `category` VARCHAR(191) NULL,
    `imagePath` VARCHAR(191) NOT NULL,
    `imageMimeType` VARCHAR(191) NOT NULL,
    `imageFileSize` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GalleryImage_published_sortOrder_idx`(`published`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
