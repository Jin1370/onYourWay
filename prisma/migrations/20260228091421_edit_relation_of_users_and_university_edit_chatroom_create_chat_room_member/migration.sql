/*
  Warnings:

  - You are about to drop the `UnivReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnivReviewComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnivReviewLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChatRoomToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `universityId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `University` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "_ChatRoomToUser_B_index";

-- DropIndex
DROP INDEX "_ChatRoomToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UnivReview";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UnivReviewComment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UnivReviewLike";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ChatRoomToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ChatRoomMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "is_muted" BOOLEAN NOT NULL DEFAULT false,
    "last_read_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatRoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChatRoomMember_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_UserUnivInterests" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_UserUnivInterests_A_fkey" FOREIGN KEY ("A") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserUnivInterests_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'DIRECT',
    "universityId" INTEGER,
    "productId" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ChatRoom_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ChatRoom_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChatRoom" ("created_at", "id", "updated_at") SELECT "created_at", "id", "updated_at" FROM "ChatRoom";
DROP TABLE "ChatRoom";
ALTER TABLE "new_ChatRoom" RENAME TO "ChatRoom";
CREATE UNIQUE INDEX "ChatRoom_universityId_key" ON "ChatRoom"("universityId");
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("chatRoomId", "content", "created_at", "id", "updated_at", "userId") SELECT "chatRoomId", "content", "created_at", "id", "updated_at", "userId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL,
    "photo" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("created_at", "description", "id", "photo", "price", "title", "updated_at", "userId", "views") SELECT "created_at", "description", "id", "photo", "price", "title", "updated_at", "userId", "views" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "avatar" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "created_at", "email", "id", "password", "updated_at", "username") SELECT "avatar", "created_at", "email", "id", "password", "updated_at", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Wish" (
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "productId"),
    CONSTRAINT "Wish_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Wish_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Wish" ("created_at", "productId", "updated_at", "userId") SELECT "created_at", "productId", "updated_at", "userId" FROM "Wish";
DROP TABLE "Wish";
ALTER TABLE "new_Wish" RENAME TO "Wish";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoomMember_userId_chatRoomId_key" ON "ChatRoomMember"("userId", "chatRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserUnivInterests_AB_unique" ON "_UserUnivInterests"("A", "B");

-- CreateIndex
CREATE INDEX "_UserUnivInterests_B_index" ON "_UserUnivInterests"("B");

-- CreateIndex
CREATE UNIQUE INDEX "University_name_key" ON "University"("name");
