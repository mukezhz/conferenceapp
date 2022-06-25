/*
  Warnings:

  - You are about to drop the column `expirity` on the `join_codes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "join_codes" DROP COLUMN "expirity",
ADD COLUMN     "expire_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
