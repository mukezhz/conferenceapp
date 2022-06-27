/*
  Warnings:

  - The `status` column on the `meetings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `waiting_users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StatusMeeting" AS ENUM ('NEW', 'CANCEL');

-- CreateEnum
CREATE TYPE "StatusWaiting" AS ENUM ('WAITING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "meetings" DROP COLUMN "status",
ADD COLUMN     "status" "StatusMeeting" NOT NULL DEFAULT E'NEW';

-- AlterTable
ALTER TABLE "waiting_users" DROP COLUMN "status",
ADD COLUMN     "status" "StatusWaiting" NOT NULL DEFAULT E'WAITING';

-- DropEnum
DROP TYPE "StatusRole";
