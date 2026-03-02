PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postType" TEXT NOT NULL DEFAULT 'LIFELOG',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Post" ("id", "postType", "title", "content", "views", "created_at", "updated_at", "userId")
SELECT
    "id",
    CASE
        WHEN "postType" = 'POST' THEN 'LIFELOG'
        WHEN "postType" = 'QUESTION' THEN 'FREE'
        ELSE "postType"
    END,
    "title",
    "content",
    "views",
    "created_at",
    "updated_at",
    "userId"
FROM "Post";

DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
