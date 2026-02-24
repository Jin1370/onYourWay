/*
  Warnings:

  - The primary key for the `ChatRooms` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatRooms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_ChatRooms" ("created_at", "id", "updated_at") SELECT "created_at", "id", "updated_at" FROM "ChatRooms";
DROP TABLE "ChatRooms";
ALTER TABLE "new_ChatRooms" RENAME TO "ChatRooms";
CREATE TABLE "new_Messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "chatRoomsId" TEXT NOT NULL,
    CONSTRAINT "Messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Messages_chatRoomsId_fkey" FOREIGN KEY ("chatRoomsId") REFERENCES "ChatRooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Messages" ("chatRoomsId", "content", "created_at", "id", "updated_at", "userId") SELECT "chatRoomsId", "content", "created_at", "id", "updated_at", "userId" FROM "Messages";
DROP TABLE "Messages";
ALTER TABLE "new_Messages" RENAME TO "Messages";
CREATE TABLE "new__ChatRoomsToUser" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ChatRoomsToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ChatRoomsToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__ChatRoomsToUser" ("A", "B") SELECT "A", "B" FROM "_ChatRoomsToUser";
DROP TABLE "_ChatRoomsToUser";
ALTER TABLE "new__ChatRoomsToUser" RENAME TO "_ChatRoomsToUser";
CREATE UNIQUE INDEX "_ChatRoomsToUser_AB_unique" ON "_ChatRoomsToUser"("A", "B");
CREATE INDEX "_ChatRoomsToUser_B_index" ON "_ChatRoomsToUser"("B");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
