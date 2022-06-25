-- DropIndex
DROP INDEX "meetings_count_key";

-- AlterTable
ALTER TABLE "meetings" ALTER COLUMN "cover_image" DROP NOT NULL;
