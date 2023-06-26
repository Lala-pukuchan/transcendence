-- CreateTable
CREATE TABLE "user_info" (
    "user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "picture_path" TEXT,

    CONSTRAINT "user_info_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "room_info" (
    "room_id" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "room_type_1" TEXT NOT NULL,
    "room_type_2" TEXT NOT NULL,
    "room_password" TEXT,

    CONSTRAINT "room_info_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "user_room_map" (
    "user_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_type" TEXT,

    CONSTRAINT "user_room_map_pkey" PRIMARY KEY ("user_id","room_id")
);

-- CreateTable
CREATE TABLE "chat_info" (
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "chat_time" TIMESTAMP(3) NOT NULL,
    "chat_text" TEXT NOT NULL,
    "contents_path" TEXT,

    CONSTRAINT "chat_info_pkey" PRIMARY KEY ("room_id","chat_time")
);

-- AddForeignKey
ALTER TABLE "user_room_map" ADD CONSTRAINT "user_room_map_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_info"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_room_map" ADD CONSTRAINT "user_room_map_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room_info"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_info" ADD CONSTRAINT "chat_info_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room_info"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_info" ADD CONSTRAINT "chat_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_info"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
