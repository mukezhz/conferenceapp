-- CreateEnum
CREATE TYPE "StatusRole" AS ENUM ('NEW', 'PENDING', 'CANCEL');

-- CreateTable
CREATE TABLE "meetings" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "description" TEXT,
    "participants" JSONB NOT NULL DEFAULT '{}',
    "start_data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusRole" NOT NULL DEFAULT E'NEW',
    "cover_image" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "waiting_room_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meetings_uuid_key" ON "meetings"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "meetings_room_key" ON "meetings"("room");

-- CreateIndex
CREATE UNIQUE INDEX "meetings_user_id_key" ON "meetings"("user_id");
