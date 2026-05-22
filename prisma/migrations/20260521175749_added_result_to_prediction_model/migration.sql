/*
  Warnings:

  - You are about to drop the column `predictedAway` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `predictedHome` on the `Prediction` table. All the data in the column will be lost.
  - Added the required column `result` to the `Prediction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Prediction` DROP COLUMN `predictedAway`,
    DROP COLUMN `predictedHome`,
    ADD COLUMN `result` VARCHAR(191) NOT NULL,
    ADD COLUMN `scored` BOOLEAN NOT NULL DEFAULT false;
