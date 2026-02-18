/*
  Warnings:

  - The primary key for the `Wishes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `productsId` on the `Wishes` table. All the data in the column will be lost.
  - Added the required column `productId` to the `Wishes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Wishes" (
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "productId"),
    CONSTRAINT "Wishes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Wishes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Wishes" ("created_at", "updated_at", "userId") SELECT "created_at", "updated_at", "userId" FROM "Wishes";
DROP TABLE "Wishes";
ALTER TABLE "new_Wishes" RENAME TO "Wishes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
