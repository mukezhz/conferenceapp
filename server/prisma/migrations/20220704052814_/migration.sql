/*
  Warnings:

  - The values [CANCEL] on the enum `StatusMeeting` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusMeeting_new" AS ENUM ('NEW', 'CANCELED', 'ENDED');
ALTER TABLE "meetings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "meetings" ALTER COLUMN "status" TYPE "StatusMeeting_new" USING ("status"::text::"StatusMeeting_new");
ALTER TYPE "StatusMeeting" RENAME TO "StatusMeeting_old";
ALTER TYPE "StatusMeeting_new" RENAME TO "StatusMeeting";
DROP TYPE "StatusMeeting_old";
ALTER TABLE "meetings" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "meetings" ALTER COLUMN "start_date" SET DEFAULT 0,
ALTER COLUMN "created_at" SET DEFAULT 0,
ALTER COLUMN "updated_at" SET DEFAULT 0;
