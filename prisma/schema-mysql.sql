-- ============================================
-- IAA Digital - MySQL Schema (Direct Import)
-- ============================================
-- Import file ini via phpMyAdmin atau MySQL CLI
-- Tidak perlu Prisma db push
--
-- Cara pakai:
-- 1. Buka phpMyAdmin → pilih database iaa_digital
-- 2. Klik tab "Import"
-- 3. Pilih file ini (schema-mysql.sql)
-- 4. Klik "Go"
-- Atau via CLI:
--   mysql -u root -p iaa_digital < schema-mysql.sql
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- DROP TABLES (jika sudah ada)
-- ============================================

DROP TABLE IF EXISTS `MenuConfig`;
DROP TABLE IF EXISTS `SiteSetting`;
DROP TABLE IF EXISTS `BackupHistory`;
DROP TABLE IF EXISTS `OAuthAccount`;
DROP TABLE IF EXISTS `Notification`;
DROP TABLE IF EXISTS `ChatMessage`;
DROP TABLE IF EXISTS `ChatConversation`;
DROP TABLE IF EXISTS `ArchiveAccess`;
DROP TABLE IF EXISTS `ArchiveVersion`;
DROP TABLE IF EXISTS `Archive`;
DROP TABLE IF EXISTS `ContactMessage`;
DROP TABLE IF EXISTS `AuditLog`;
DROP TABLE IF EXISTS `OrganizationMember`;
DROP TABLE IF EXISTS `Announcement`;
DROP TABLE IF EXISTS `GalleryPhoto`;
DROP TABLE IF EXISTS `GalleryAlbum`;
DROP TABLE IF EXISTS `LibraryItem`;
DROP TABLE IF EXISTS `Certificate`;
DROP TABLE IF EXISTS `Registration`;
DROP TABLE IF EXISTS `Event`;
DROP TABLE IF EXISTS `MediaAsset`;
DROP TABLE IF EXISTS `ArticleRevision`;
DROP TABLE IF EXISTS `Article`;
DROP TABLE IF EXISTS `Member`;
DROP TABLE IF EXISTS `User`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- CREATE TABLES
-- ============================================

-- User
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `role` ENUM('SUPER_ADMIN','ADMINISTRATOR','PENGURUS','ANGGOTA') NOT NULL DEFAULT 'ANGGOTA',
  `avatar` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `lastLoginAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `User_email_key`(`email`),
  INDEX `User_role_idx`(`role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Member
CREATE TABLE `Member` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `memberNumber` VARCHAR(191) NOT NULL,
  `nip` VARCHAR(191) NULL,
  `fullName` VARCHAR(191) NOT NULL,
  `photo` VARCHAR(191) NULL,
  `workUnit` VARCHAR(191) NULL,
  `position` VARCHAR(191) NULL,
  `arsiparisLevel` ENUM('PEMULA','MUDA','MADYA','UTAMA') NULL,
  `education` VARCHAR(191) NULL,
  `trainingHistory` LONGTEXT NULL,
  `certificationHistory` LONGTEXT NULL,
  `status` ENUM('AKTIF','TIDAK_AKTIF','PENSIUN','MENINGGAL') NOT NULL DEFAULT 'AKTIF',
  `joinDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Member_userId_key`(`userId`),
  UNIQUE INDEX `Member_memberNumber_key`(`memberNumber`),
  INDEX `Member_status_idx`(`status`),
  INDEX `Member_arsiparisLevel_idx`(`arsiparisLevel`),
  CONSTRAINT `Member_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Article
CREATE TABLE `Article` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `excerpt` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `featuredImage` VARCHAR(191) NULL,
  `category` VARCHAR(191) NOT NULL DEFAULT 'Umum',
  `tags` VARCHAR(191) NULL,
  `isFeatured` BOOLEAN NOT NULL DEFAULT false,
  `isPublished` BOOLEAN NOT NULL DEFAULT true,
  `publishStatus` ENUM('DRAFT','SCHEDULED','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
  `scheduledAt` DATETIME(3) NULL,
  `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `viewCount` INTEGER NOT NULL DEFAULT 0,
  `authorId` VARCHAR(191) NOT NULL,
  `metaDescription` VARCHAR(191) NULL,
  `ogTitle` VARCHAR(191) NULL,
  `ogImage` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Article_slug_key`(`slug`),
  INDEX `Article_isPublished_publishedAt_idx`(`isPublished`, `publishedAt`),
  INDEX `Article_category_idx`(`category`),
  INDEX `Article_publishStatus_idx`(`publishStatus`),
  CONSTRAINT `Article_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ArticleRevision
CREATE TABLE `ArticleRevision` (
  `id` VARCHAR(191) NOT NULL,
  `articleId` VARCHAR(191) NOT NULL,
  `version` INTEGER NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `excerpt` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `editedById` VARCHAR(191) NOT NULL,
  `changeLog` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ArticleRevision_articleId_version_key`(`articleId`, `version`),
  INDEX `ArticleRevision_articleId_idx`(`articleId`),
  CONSTRAINT `ArticleRevision_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ArticleRevision_editedById_fkey` FOREIGN KEY (`editedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- MediaAsset
CREATE TABLE `MediaAsset` (
  `id` VARCHAR(191) NOT NULL,
  `filename` VARCHAR(191) NOT NULL,
  `storedName` VARCHAR(191) NOT NULL,
  `url` VARCHAR(191) NOT NULL,
  `mimeType` VARCHAR(191) NOT NULL,
  `size` INTEGER NOT NULL,
  `width` INTEGER NULL,
  `height` INTEGER NULL,
  `alt` VARCHAR(191) NULL,
  `caption` VARCHAR(191) NULL,
  `thumbUrl` VARCHAR(191) NULL,
  `mediumUrl` VARCHAR(191) NULL,
  `largeUrl` VARCHAR(191) NULL,
  `uploadedById` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `MediaAsset_uploadedById_idx`(`uploadedById`),
  INDEX `MediaAsset_mimeType_idx`(`mimeType`),
  CONSTRAINT `MediaAsset_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Event
CREATE TABLE `Event` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `eventType` ENUM('SEMINAR','WORKSHOP','WEBINAR','RAPAT','PELATIHAN','LOMBA') NOT NULL,
  `coverImage` VARCHAR(191) NULL,
  `location` VARCHAR(191) NOT NULL,
  `startDate` DATETIME(3) NOT NULL,
  `endDate` DATETIME(3) NOT NULL,
  `quota` INTEGER NOT NULL DEFAULT 100,
  `registeredCount` INTEGER NOT NULL DEFAULT 0,
  `isPublished` BOOLEAN NOT NULL DEFAULT true,
  `isRegistrationOpen` BOOLEAN NOT NULL DEFAULT true,
  `organizerId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Event_slug_key`(`slug`),
  INDEX `Event_startDate_idx`(`startDate`),
  INDEX `Event_eventType_idx`(`eventType`),
  CONSTRAINT `Event_organizerId_fkey` FOREIGN KEY (`organizerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Registration
CREATE TABLE `Registration` (
  `id` VARCHAR(191) NOT NULL,
  `eventId` VARCHAR(191) NOT NULL,
  `memberId` VARCHAR(191) NOT NULL,
  `status` ENUM('PENDING','APPROVED','REJECTED','WAITING_LIST','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `checkedIn` BOOLEAN NOT NULL DEFAULT false,
  `checkedInAt` DATETIME(3) NULL,
  `registeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Registration_eventId_memberId_key`(`eventId`, `memberId`),
  INDEX `Registration_status_idx`(`status`),
  CONSTRAINT `Registration_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Registration_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Certificate
CREATE TABLE `Certificate` (
  `id` VARCHAR(191) NOT NULL,
  `certificateNumber` VARCHAR(191) NOT NULL,
  `eventId` VARCHAR(191) NULL,
  `memberId` VARCHAR(191) NOT NULL,
  `issuedById` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `template` VARCHAR(191) NOT NULL DEFAULT 'default',
  `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Certificate_certificateNumber_key`(`certificateNumber`),
  INDEX `Certificate_memberId_idx`(`memberId`),
  INDEX `Certificate_eventId_idx`(`eventId`),
  CONSTRAINT `Certificate_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Certificate_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Certificate_issuedById_fkey` FOREIGN KEY (`issuedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- LibraryItem
CREATE TABLE `LibraryItem` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `category` ENUM('BUKU','EBOOK','JURNAL','PEDOMAN','REGULASI','SOP','TEMPLATE','PRESENTASI','MAJALAH','VIDEO','AUDIO') NOT NULL,
  `author` VARCHAR(191) NULL,
  `publisher` VARCHAR(191) NULL,
  `year` INTEGER NULL,
  `coverImage` VARCHAR(191) NULL,
  `fileUrl` VARCHAR(191) NULL,
  `fileSize` INTEGER NULL,
  `pages` INTEGER NULL,
  `tags` VARCHAR(191) NULL,
  `downloadCount` INTEGER NOT NULL DEFAULT 0,
  `viewCount` INTEGER NOT NULL DEFAULT 0,
  `isPublished` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `LibraryItem_slug_key`(`slug`),
  INDEX `LibraryItem_category_idx`(`category`),
  INDEX `LibraryItem_isPublished_idx`(`isPublished`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- GalleryAlbum
CREATE TABLE `GalleryAlbum` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `coverImage` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- GalleryPhoto
CREATE TABLE `GalleryPhoto` (
  `id` VARCHAR(191) NOT NULL,
  `albumId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NULL,
  `url` VARCHAR(191) NOT NULL,
  `order` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `GalleryPhoto_albumId_idx`(`albumId`),
  INDEX `GalleryPhoto_albumId_order_idx`(`albumId`, `order`),
  CONSTRAINT `GalleryPhoto_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `GalleryAlbum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Announcement
CREATE TABLE `Announcement` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `type` ENUM('BANNER','POPUP','RUNNING_TEXT','PINNED') NOT NULL DEFAULT 'BANNER',
  `isPinned` BOOLEAN NOT NULL DEFAULT false,
  `isPopup` BOOLEAN NOT NULL DEFAULT false,
  `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endDate` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- OrganizationMember
CREATE TABLE `OrganizationMember` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `position` VARCHAR(191) NOT NULL,
  `photo` VARCHAR(191) NULL,
  `bio` VARCHAR(191) NULL,
  `order` INTEGER NOT NULL DEFAULT 0,
  `category` VARCHAR(191) NOT NULL DEFAULT 'Pengurus Pusat',
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `OrganizationMember_category_isActive_idx`(`category`, `isActive`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AuditLog
CREATE TABLE `AuditLog` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `action` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `AuditLog_userId_idx`(`userId`),
  INDEX `AuditLog_createdAt_idx`(`createdAt`),
  CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ContactMessage
CREATE TABLE `ContactMessage` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `subject` VARCHAR(191) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ContactMessage_isRead_idx`(`isRead`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Archive
CREATE TABLE `Archive` (
  `id` VARCHAR(191) NOT NULL,
  `archiveNumber` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` LONGTEXT NULL,
  `category` ENUM('SURAT_MASUK','SURAT_KELUAR','DOKUMEN_RAPAT','SK','AD_ART','MOU','DOKUMEN_ORGANISASI','FOTO','VIDEO') NOT NULL,
  `documentDate` DATETIME(3) NOT NULL,
  `source` VARCHAR(191) NULL,
  `destination` VARCHAR(191) NULL,
  `classification` ENUM('PUBLIK','INTERNAL','RAHASIA','SANGAT_RAHASIA') NOT NULL DEFAULT 'PUBLIK',
  `accessLevel` ENUM('PUBLIK','ANGGOTA','PENGURUS','ADMIN','SUPER_ADMIN') NOT NULL DEFAULT 'PUBLIK',
  `tags` VARCHAR(191) NULL,
  `currentVersion` INTEGER NOT NULL DEFAULT 1,
  `isPinned` BOOLEAN NOT NULL DEFAULT false,
  `uploadedById` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Archive_archiveNumber_key`(`archiveNumber`),
  INDEX `Archive_category_idx`(`category`),
  INDEX `Archive_classification_idx`(`classification`),
  INDEX `Archive_accessLevel_idx`(`accessLevel`),
  INDEX `Archive_documentDate_idx`(`documentDate`),
  CONSTRAINT `Archive_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ArchiveVersion
CREATE TABLE `ArchiveVersion` (
  `id` VARCHAR(191) NOT NULL,
  `archiveId` VARCHAR(191) NOT NULL,
  `version` INTEGER NOT NULL,
  `fileUrl` VARCHAR(191) NULL,
  `fileName` VARCHAR(191) NULL,
  `fileSize` INTEGER NULL,
  `mimeType` VARCHAR(191) NULL,
  `changeLog` VARCHAR(191) NULL,
  `uploadedById` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ArchiveVersion_archiveId_version_key`(`archiveId`, `version`),
  INDEX `ArchiveVersion_archiveId_idx`(`archiveId`),
  CONSTRAINT `ArchiveVersion_archiveId_fkey` FOREIGN KEY (`archiveId`) REFERENCES `Archive`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ArchiveVersion_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ArchiveAccess
CREATE TABLE `ArchiveAccess` (
  `id` VARCHAR(191) NOT NULL,
  `archiveId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `action` VARCHAR(191) NOT NULL,
  `ipAddress` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ArchiveAccess_archiveId_idx`(`archiveId`),
  INDEX `ArchiveAccess_userId_idx`(`userId`),
  CONSTRAINT `ArchiveAccess_archiveId_fkey` FOREIGN KEY (`archiveId`) REFERENCES `Archive`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ArchiveAccess_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ChatConversation
CREATE TABLE `ChatConversation` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `guestName` VARCHAR(191) NULL,
  `title` VARCHAR(191) NOT NULL DEFAULT 'Percakapan Baru',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `ChatConversation_userId_idx`(`userId`),
  CONSTRAINT `ChatConversation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ChatMessage
CREATE TABLE `ChatMessage` (
  `id` VARCHAR(191) NOT NULL,
  `conversationId` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ChatMessage_conversationId_idx`(`conversationId`),
  CONSTRAINT `ChatMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `ChatConversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Notification
CREATE TABLE `Notification` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `type` ENUM('SYSTEM','EVENT_REMINDER','REGISTRATION_STATUS','CERTIFICATE_ISSUED','ANNOUNCEMENT','MESSAGE') NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `message` LONGTEXT NOT NULL,
  `link` VARCHAR(191) NULL,
  `data` LONGTEXT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `readAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Notification_userId_isRead_idx`(`userId`, `isRead`),
  INDEX `Notification_createdAt_idx`(`createdAt`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- OAuthAccount
CREATE TABLE `OAuthAccount` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NOT NULL,
  `providerAccountId` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `name` VARCHAR(191) NULL,
  `avatar` VARCHAR(191) NULL,
  `accessToken` VARCHAR(191) NULL,
  `refreshToken` VARCHAR(191) NULL,
  `expiresAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `OAuthAccount_provider_providerAccountId_key`(`provider`, `providerAccountId`),
  INDEX `OAuthAccount_userId_idx`(`userId`),
  CONSTRAINT `OAuthAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- BackupHistory
CREATE TABLE `BackupHistory` (
  `id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `fileName` VARCHAR(191) NOT NULL,
  `fileSize` INTEGER NULL,
  `recordCount` INTEGER NULL,
  `triggeredById` VARCHAR(191) NULL,
  `notes` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `BackupHistory_createdAt_idx`(`createdAt`),
  INDEX `BackupHistory_status_idx`(`status`),
  CONSTRAINT `BackupHistory_triggeredById_fkey` FOREIGN KEY (`triggeredById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- SiteSetting
CREATE TABLE `SiteSetting` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` LONGTEXT NULL,
  `type` VARCHAR(191) NOT NULL DEFAULT 'text',
  `category` VARCHAR(191) NOT NULL DEFAULT 'general',
  `updatedAt` DATETIME(3) NOT NULL,
  `updatedById` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `SiteSetting_key_key`(`key`),
  CONSTRAINT `SiteSetting_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- MenuConfig
CREATE TABLE `MenuConfig` (
  `id` VARCHAR(191) NOT NULL,
  `label` VARCHAR(191) NOT NULL,
  `labelKey` VARCHAR(191) NULL,
  `view` VARCHAR(191) NULL,
  `url` VARCHAR(191) NULL,
  `icon` VARCHAR(191) NULL,
  `parentId` VARCHAR(191) NULL,
  `order` INTEGER NOT NULL DEFAULT 0,
  `isVisible` BOOLEAN NOT NULL DEFAULT true,
  `isExternal` BOOLEAN NOT NULL DEFAULT false,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `MenuConfig_parentId_idx`(`parentId`),
  INDEX `MenuConfig_order_idx`(`order`),
  INDEX `MenuConfig_isVisible_idx`(`isVisible`),
  CONSTRAINT `MenuConfig_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `MenuConfig`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA
-- ============================================

-- Password: iaa12345 (SHA-256 hash)
-- Hash: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8

INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `isActive`, `createdAt`, `updatedAt`) VALUES
('cmrotc76h0000sl7w16q1lres', 'superadmin@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Dr. Bambang Sutrisno, M.Si.', 'SUPER_ADMIN', true, NOW(), NOW()),
('cmrotc76h0001sl7w4d2j9m5kp', 'admin@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Siti Nurhaliza, S.Kom.', 'ADMINISTRATOR', true, NOW(), NOW()),
('cmrotc76h0002sl7wrv48zzcv', 'pengurus@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Drs. Ahmad Fauzi, M.Ars.', 'PENGURUS', true, NOW(), NOW()),
('cmrotc76h0003sl7w4f7ridi3', 'anggota@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Rina Wijayanti, S.Sos.', 'ANGGOTA', true, NOW(), NOW()),
('cmrotc76h0004sl7w8k2n4m7pq', 'budi.santoso@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Budi Santoso, S.Hum.', 'ANGGOTA', true, NOW(), NOW()),
('cmrotc76h0005sl7w1p3t6v8qr', 'dewi.lestari@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Dewi Lestari, M.Ars.', 'ANGGOTA', true, NOW(), NOW());

-- Members
INSERT INTO `Member` (`id`, `userId`, `memberNumber`, `nip`, `fullName`, `workUnit`, `position`, `arsiparisLevel`, `education`, `trainingHistory`, `certificationHistory`, `status`, `joinDate`, `createdAt`, `updatedAt`) VALUES
('cmrotc76p0007sl7wrv48zzcv', 'cmrotc76h0003sl7w4f7ridi3', 'IAA-2024-0001', '198503152010012001', 'Rina Wijayanti, S.Sos.', 'ANRI - Pusat Konservasi Arsip', 'Arsiparis Muda', 'MUDA', 'S1 - Ilmu Perpustakaan UI (2008)', '[{"name":"Pelatihan Konservasi Arsip Digital","year":2022,"organizer":"ANRI"},{"name":"Workshop Manajemen Records","year":2023,"organizer":"IAA"}]', '[{"name":"Sertifikasi Arsiparis Muda","year":2021,"number":"AR-M-2021-045"}]', 'AKTIF', '2024-01-15', NOW(), NOW()),
('cmrotc76q0008sl7w2n4m7pq', 'cmrotc76h0004sl7w8k2n4m7pq', 'IAA-2024-0002', '198811202012011002', 'Budi Santoso, S.Hum.', 'ANRI - Direktorat Layanan Arsip', 'Arsiparis Pemula', 'PEMULA', 'S1 - Sejarah UGM (2011)', '[{"name":"Pelatihan Dasar Kearsipan","year":2023,"organizer":"ANRI"}]', '[]', 'AKTIF', '2024-02-10', NOW(), NOW()),
('cmrotc76r0009sl7w1p3t6v8q', 'cmrotc76h0005sl7w1p3t6v8qr', 'IAA-2023-0156', '198006152008012003', 'Dewi Lestari, M.Ars.', 'ANRI - Pusat Penelitian Kearsipan', 'Arsiparis Madya', 'MADYA', 'S2 - Ilmu Informasi UI (2015)', '[{"name":"Pelatihan Manajemen Arsip Elektronik","year":2022,"organizer":"IRMT"},{"name":"Workshop Digital Preservation","year":2023,"organizer":"ICA"}]', '[{"name":"Sertifikasi Arsiparis Muda","year":2018,"number":"AR-M-2018-112"},{"name":"Sertifikasi Arsiparis Madya","year":2023,"number":"AR-MD-2023-028"}]', 'AKTIF', '2023-08-20', NOW(), NOW()),
('cmrotc76s0010sl7w3t6v8qr', 'cmrotc76h0002sl7wrv48zzcv', 'IAA-2020-0089', '197504102003121002', 'Drs. Ahmad Fauzi, M.Ars.', 'ANRI - Sekretariat Utama', 'Arsiparis Utama', 'UTAMA', 'S2 - Manajemen Pemerintahan LAN (2010)', '[{"name":"Pelatihan Kepemimpinan Administrasi","year":2019,"organizer":"LAN"}]', '[{"name":"Sertifikasi Arsiparis Utama","year":2020,"number":"AR-U-2020-012"}]', 'AKTIF', '2020-03-01', NOW(), NOW());

-- Organization Members
INSERT INTO `OrganizationMember` (`id`, `name`, `position`, `category`, `order`, `isActive`, `createdAt`, `updatedAt`) VALUES
('org-001', 'Dr. H. M. Asman, M.Si.', 'Ketua Umum', 'Pengurus Pusat', 1, true, NOW(), NOW()),
('org-002', 'Dra. Tati Suharti, M.Ars.', 'Wakil Ketua Umum', 'Pengurus Pusat', 2, true, NOW(), NOW()),
('org-003', 'Drs. Ahmad Fauzi, M.Ars.', 'Sekretaris Jenderal', 'Pengurus Pusat', 3, true, NOW(), NOW()),
('org-004', 'Rina Wijayanti, S.Sos.', 'Bendahara Umum', 'Pengurus Pusat', 4, true, NOW(), NOW()),
('org-005', 'Dewi Lestari, M.Ars.', 'Ketua Bidang Profesional', 'Bidang', 5, true, NOW(), NOW()),
('org-006', 'Budi Santoso, S.Hum.', 'Ketua Bidang Litbang', 'Bidang', 6, true, NOW(), NOW()),
('org-007', 'Prof. Dr. Endang S., M.Hum.', 'Pembina', 'Dewan Pembina', 7, true, NOW(), NOW()),
('org-008', 'Dr. Ir. Hendro W., M.M.', 'Pembina', 'Dewan Pembina', 8, true, NOW(), NOW());

-- Articles
INSERT INTO `Article` (`id`, `slug`, `title`, `excerpt`, `content`, `category`, `tags`, `isFeatured`, `isPublished`, `publishStatus`, `publishedAt`, `viewCount`, `authorId`, `createdAt`, `updatedAt`) VALUES
('art-001', 'rapat-koordinasi-nasional-arsiparis-2026', 'Rapat Koordinasi Nasional Arsiparis 2026 Diselenggarakan di Jakarta', 'IAA menggelar Rakornas arsiparis dengan tema "Transformasi Digital Kearsipan untuk Indonesia Emas 2045".', 'Jakarta — Ikatan Arsiparis ANRI (IAA) sukses menyelenggarakan Rapat Koordinasi Nasional (Rakornas) Arsiparis 2026 di Hotel Bidakara, Jakarta, pada 12-14 Maret 2026.', 'Kegiatan', 'rakornas,arsiparis,jakarta,digitalisasi', true, true, 'PUBLISHED', '2026-03-15', 245, 'cmrotc76h0002sl7wrv48zzcv', NOW(), NOW()),
('art-002', 'pelatihan-sertifikasi-arsiparis-madya-batch-12', 'Pelatihan dan Sertifikasi Arsiparis Madya Batch 12 Resmi Dibuka', 'Program pelatihan intensif 3 bulan untuk peningkatan kompetensi arsiparis muda menuju madya dibuka untuk 60 peserta.', 'IAA bersama Pusat Pengembangan Sumber Daya Manusia (PPSDM) ANRI resmi membuka pendaftaran Pelatihan dan Sertifikasi Arsiparis Madya Batch ke-12.', 'Pelatihan', 'pelatihan,sertifikasi,arsiparis madya', true, true, 'PUBLISHED', '2026-04-05', 189, 'cmrotc76h0001sl7w4d2j9m5kp', NOW(), NOW()),
('art-003', 'hari-arsip-nasional-2026', 'Peringatan Hari Arsip Nasional ke-53 Tahun 2026', 'IAA merayakan Hari Arsip Nasional dengan rangkaian kegiatan refleksi profesi dan penghargaan arsiparis berprestasi.', 'Jakarta — Ikatan Arsiparis ANRI (IAA) bersama ANRI merayakan Hari Arsip Nasional (Harwanas) ke-53 pada 18 Juni 2026.', 'Kegiatan', 'harwanas,peringatan,arsip nasional', true, true, 'PUBLISHED', '2026-06-18', 312, 'cmrotc76h0000sl7w16q1lres', NOW(), NOW()),
('art-004', 'kerja-sama-iaa-dengan-perpustakaan-nasional', 'IAA dan Perpustakaan Nasional Tandatangani MoU Pengembangan Digital Library', 'Kerja sama strategis untuk membangun ekosistem digital library terintegrasi antara arsip dan perpustakaan nasional.', 'Jakarta — Ikatan Arsiparis ANRI (IAA) dan Perpustakaan Nasional RI (Perpusnas) menandatangani Nota Kesepahaman (MoU).', 'Kerja Sama', 'mou,perpusnas,digital library,kerja sama', false, true, 'PUBLISHED', '2026-05-21', 156, 'cmrotc76h0000sl7w16q1lres', NOW(), NOW()),
('art-005', 'workshop-digital-preservation-strategi', 'Workshop Digital Preservation: Strategi dan Tantangan Era Cloud', 'IAA menggelar workshop dua hari mengupas strategi preservasi digital di era komputasi awan.', 'Bandung — IAA menyelenggarakan workshop "Digital Preservation: Strategi dan Tantangan Era Cloud".', 'Workshop', 'workshop,digital preservation,bandung,cloud', false, true, 'PUBLISHED', '2026-06-10', 98, 'cmrotc76h0002sl7wrv48zzcv', NOW(), NOW());

-- Events
INSERT INTO `Event` (`id`, `slug`, `title`, `description`, `eventType`, `location`, `startDate`, `endDate`, `quota`, `registeredCount`, `isPublished`, `isRegistrationOpen`, `organizerId`, `createdAt`, `updatedAt`) VALUES
('evt-001', 'webinar-transformasi-digital-kearsipan', 'Webinar: Transformasi Digital Kearsipan — Peluang & Tantangan', 'Webinar nasional membahas roadmap transformasi digital kearsipan Indonesia 2025-2030.', 'WEBINAR', 'Zoom Webinar', '2026-07-25 09:00:00', '2026-07-25 12:00:00', 500, 312, true, true, 'cmrotc76h0002sl7wrv48zzcv', NOW(), NOW()),
('evt-002', 'pelatihan-manajemen-arsip-elektronik', 'Pelatihan Manajemen Arsip Elektronik Berbasis Srikandi', 'Pelatihan praktis penggunaan aplikasi Srikandi untuk manajemen arsip dinamis.', 'PELATIHAN', 'Pusdiklat ANRI, Jakarta', '2026-08-10 08:00:00', '2026-08-12 16:00:00', 60, 48, true, true, 'cmrotc76h0001sl7w4d2j9m5kp', NOW(), NOW()),
('evt-003', 'workshop-kurasi-digital', 'Workshop Kurasi Digital: Dari Metadata ke Knowledge Graph', 'Workshop intensif tentang teknik kurasi digital, penerapan linked data.', 'WORKSHOP', 'Hotel Harris, Bandung', '2026-08-22 09:00:00', '2026-08-23 17:00:00', 40, 35, true, true, 'cmrotc76h0002sl7wrv48zzcv', NOW(), NOW()),
('evt-004', 'seminar-nasional-kearsipan-2026', 'Seminar Nasional Kearsipan 2026: Arsip & Kecerdasan Artifisial', 'Seminar nasional tahunan membahas integrasi AI dalam manajemen arsip.', 'SEMINAR', 'Balai Kartini, Jakarta', '2026-09-18 08:30:00', '2026-09-18 16:00:00', 300, 187, true, true, 'cmrotc76h0000sl7w16q1lres', NOW(), NOW()),
('evt-005', 'rapat-pleno-pengurus-pusat', 'Rapat Pleno Pengurus Pusat IAA — Triwulan III 2026', 'Rapat pleno pengurus pusat untuk evaluasi program triwulan III.', 'RAPAT', 'Kantor Pusat IAA, Jakarta', '2026-10-15 09:00:00', '2026-10-15 15:00:00', 25, 22, true, false, 'cmrotc76h0000sl7w16q1lres', NOW(), NOW());

-- Library Items
INSERT INTO `LibraryItem` (`id`, `title`, `slug`, `description`, `category`, `author`, `publisher`, `year`, `pages`, `tags`, `downloadCount`, `viewCount`, `isPublished`, `createdAt`, `updatedAt`) VALUES
('lib-001', 'Modul Manajemen Arsip Dinamis', 'modul-manajemen-arsip-dinamis', 'Modul pembelajaran dasar manajemen arsip dinamis untuk arsiparis pemula.', 'PEDOMAN', 'IAA - Bidang Profesional', 'IAA Digital Press', 2025, 184, 'manajemen,arsip dinamis,pemula', 1240, 3420, true, NOW(), NOW()),
('lib-002', 'Undang-Undang Nomor 43 Tahun 2009 tentang Kearsipan', 'uu-43-2009-kearsipan', 'Teks lengkap UU 43/2009 yang menjadi dasar hukum sistem kearsipan nasional Indonesia.', 'REGULASI', 'Republik Indonesia', 'Lembaran Negara RI', 2009, 56, 'uu,regulasi,hukum', 5680, 12400, true, NOW(), NOW()),
('lib-003', 'Pedoman Sistem Informasi Kearsipan (Srikandi)', 'pedoman-srikandi', 'Buku pedoman lengkap penggunaan aplikasi Srikandi untuk manajemen arsip dinamis.', 'SOP', 'ANRI', 'ANRI Press', 2024, 220, 'srikandi,sistem informasi,panduan', 2890, 8760, true, NOW(), NOW()),
('lib-004', 'Jurnal Kearsipan Vol. 18 No. 1 (2026)', 'jurnal-kearsipan-v18n1-2026', 'Edisi terbaru jurnal ilmiah kearsipan berisi 8 artikel penelitian.', 'JURNAL', 'Berbagai penulis', 'IAA - Bidang Litbang', 2026, 156, 'jurnal,riset,akademik', 856, 2150, true, NOW(), NOW()),
('lib-005', 'Ebook: Digital Preservation for Archivists', 'ebook-digital-preservation', 'Ebook komprehensif tentang preservasi digital dengan pendekatan praktis.', 'EBOOK', 'Luciana Duranti', 'IAA Digital Press', 2025, 320, 'preservasi,digital,internasional', 1920, 5340, true, NOW(), NOW()),
('lib-006', 'Template SK Penjadwalan Retensi Arsip', 'template-sk-retensi', 'Template dokumen standar untuk penyusunan Surat Keputusan penjadwalan retensi arsip.', 'TEMPLATE', 'IAA - Bidang Profesional', 'IAA Digital', 2026, 24, 'template,sk,retensi', 3450, 6120, true, NOW(), NOW());

-- Gallery Albums
INSERT INTO `GalleryAlbum` (`id`, `title`, `description`, `createdAt`, `updatedAt`) VALUES
('gal-001', 'Rakornas Arsiparis 2026', 'Dokumentasi kegiatan Rapat Koordinasi Nasional Arsiparis 2026 di Jakarta.', NOW(), NOW()),
('gal-002', 'Harwanas ke-53 Tahun 2026', 'Peringatan Hari Arsip Nasional ke-53 tahun 2026.', NOW(), NOW());

-- Announcements
INSERT INTO `Announcement` (`id`, `title`, `content`, `type`, `isPinned`, `isPopup`, `startDate`, `endDate`, `createdAt`, `updatedAt`) VALUES
('ann-001', 'Pendaftaran Anggota Baru IAA 2026 Dibuka!', 'Pendaftaran anggota baru Ikatan Arsiparis ANRI periode 2026 telah dibuka. Segera daftarkan diri Anda melalui portal IAA Digital.', 'BANNER', true, false, '2026-06-01', '2026-12-31', NOW(), NOW()),
('ann-002', 'Selamat Hari Arsip Nasional ke-53', 'Selamat Hari Arsip Nasional 2026. Tema tahun ini: "Arsip sebagai Jembatan Peradaban: Membangun Indonesia yang Berkarakter".', 'RUNNING_TEXT', false, false, '2026-06-18', '2026-07-31', NOW(), NOW()),
('ann-003', 'Webinar Transformasi Digital Kearsipan — Besok!', 'Jangan lewatkan webinar nasional besok (25 Juli 2026, 09.00 WIB) membahas roadmap transformasi digital kearsipan Indonesia 2025-2030.', 'POPUP', false, true, '2026-07-20', '2026-07-25', NOW(), NOW()),
('ann-004', 'Maintenance Sistem: Sabtu 25 Jul 2026 23.00-02.00 WIB', 'Sistem IAA Digital akan menjalani maintenance terjadwal. Layanan mungkin tidak tersedia sementara.', 'PINNED', true, false, '2026-07-22', '2026-07-26', NOW(), NOW());

-- ============================================
-- DONE!
-- ============================================
-- Database siap digunakan.
-- Login demo:
--   Email: superadmin@iaa-anri.go.id
--   Password: iaa12345
-- ============================================
