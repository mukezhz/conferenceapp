-- CreateEnum
CREATE TYPE "StatusRole" AS ENUM ('NEW', 'PENDING', 'CANCEL');

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "participants" JSONB NOT NULL DEFAULT '{}',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusRole" NOT NULL DEFAULT E'NEW',
    "cover_image" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "waiting_room_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "count" SERIAL NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "join_codes" (
    "meeting_id" TEXT NOT NULL,
    "expirity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "identity" TEXT NOT NULL,
    "join_code" TEXT NOT NULL,

    CONSTRAINT "join_codes_pkey" PRIMARY KEY ("meeting_id","identity")
);

-- CreateTable
CREATE TABLE "waiting_users" (
    "meeting_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "waiting_users_pkey" PRIMARY KEY ("meeting_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meetings_room_key" ON "meetings"("room");

-- CreateIndex
CREATE UNIQUE INDEX "meetings_count_key" ON "meetings"("count");

-- CreateIndex
CREATE UNIQUE INDEX "join_codes_join_code_key" ON "join_codes"("join_code");

-- AddForeignKey
ALTER TABLE "join_codes" ADD CONSTRAINT "join_codes_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waiting_users" ADD CONSTRAINT "waiting_users_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
