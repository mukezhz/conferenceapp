-- AlterEnum
ALTER TYPE "StatusMeeting" ADD VALUE 'ENDED';

-- AlterTable
ALTER TABLE "meetings" ALTER COLUMN "start_date" SET DEFAULT 0,
ALTER COLUMN "created_at" SET DEFAULT 0,
ALTER COLUMN "updated_at" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "streamings" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "egress_id" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "email" TEXT,
    "identity" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "roomName" TEXT NOT NULL,

    CONSTRAINT "streamings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "egressId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Egress" (
    "egressId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" INTEGER NOT NULL,
    "endedAt" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "rooms_name_key" ON "rooms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Egress_egressId_key" ON "Egress"("egressId");

-- AddForeignKey
ALTER TABLE "streamings" ADD CONSTRAINT "streamings_roomName_fkey" FOREIGN KEY ("roomName") REFERENCES "rooms"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_egressId_fkey" FOREIGN KEY ("egressId") REFERENCES "Egress"("egressId") ON DELETE RESTRICT ON UPDATE CASCADE;
