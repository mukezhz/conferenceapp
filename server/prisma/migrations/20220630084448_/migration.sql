/*
  Warnings:

  - You are about to drop the column `count` on the `meetings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "meetings" DROP COLUMN "count",
ADD COLUMN     "token" TEXT NOT NULL DEFAULT E'';
