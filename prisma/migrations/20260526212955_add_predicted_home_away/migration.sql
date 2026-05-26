/*
  Warnings:

  - You are about to drop the column `result` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `scored` on the `Prediction` table. All the data in the column will be lost.
  - Added the required column `predictedAway` to the `Prediction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `predictedHome` to the `Prediction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Prediction` DROP COLUMN `result`,
    DROP COLUMN `scored`,
    ADD COLUMN `predictedAway` INTEGER NOT NULL,
    ADD COLUMN `predictedHome` INTEGER NOT NULL;
