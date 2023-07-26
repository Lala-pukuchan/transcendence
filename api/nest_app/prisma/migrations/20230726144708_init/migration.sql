-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_user1Name_fkey" FOREIGN KEY ("user1Name") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_user2Name_fkey" FOREIGN KEY ("user2Name") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
