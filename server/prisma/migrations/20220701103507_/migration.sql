-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "webhook_url" TEXT,
ALTER COLUMN "start_date" SET DEFAULT 0,
ALTER COLUMN "created_at" SET DEFAULT 0,
ALTER COLUMN "updated_at" SET DEFAULT 0;
