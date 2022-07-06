/*
  Warnings:

  - You are about to drop the column `roomName` on the `streamings` table. All the data in the column will be lost.
  - You are about to drop the `Egress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rooms` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `platform` to the `streamings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_egressId_fkey";

-- DropForeignKey
ALTER TABLE "streamings" DROP CONSTRAINT "streamings_roomName_fkey";

-- AlterTable
ALTER TABLE "meetings" ALTER COLUMN "start_date" SET DEFAULT 0,
ALTER COLUMN "created_at" SET DEFAULT 0,
ALTER COLUMN "updated_at" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "streamings" DROP COLUMN "roomName",
ADD COLUMN     "ended_at" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "platform" TEXT NOT NULL,
ADD COLUMN     "started_at" BIGINT NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Egress";

-- DropTable
DROP TABLE "rooms";

-- CreateTable
CREATE TABLE "egress" (
    "egress_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" INTEGER NOT NULL,
    "ended_at" INTEGER NOT NULL,
    "layout" TEXT NOT NULL,

    CONSTRAINT "egress_pkey" PRIMARY KEY ("egress_id")
);

-- AddForeignKey
ALTER TABLE "streamings" ADD CONSTRAINT "streamings_egress_id_fkey" FOREIGN KEY ("egress_id") REFERENCES "egress"("egress_id") ON DELETE CASCADE ON UPDATE CASCADE;
