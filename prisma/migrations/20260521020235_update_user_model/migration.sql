/*
  Warnings:

  - A unique constraint covering the columns `[ticketNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketNumber` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `phone` VARCHAR(191) NOT NULL,
    ADD COLUMN `ticketNumber` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_ticketNumber_key` ON `User`(`ticketNumber`);

-- CreateIndex
CREATE INDEX `User_ticketNumber_idx` ON `User`(`ticketNumber`);
