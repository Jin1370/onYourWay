PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "emailVerifiedAt" DATETIME,
    "password" TEXT,
    "fcmToken" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "avatar" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "foreignAffiliatedUnivId" INTEGER,
    "domesticAffiliatedUnivId" INTEGER,
    CONSTRAINT "User_foreignAffiliatedUnivId_fkey" FOREIGN KEY ("foreignAffiliatedUnivId") REFERENCES "University" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_domesticAffiliatedUnivId_fkey" FOREIGN KEY ("domesticAffiliatedUnivId") REFERENCES "University" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_User" (
    "id",
    "username",
    "email",
    "emailVerifiedAt",
    "password",
    "fcmToken",
    "latitude",
    "longitude",
    "avatar",
    "created_at",
    "updated_at",
    "foreignAffiliatedUnivId"
)
SELECT
    "id",
    "username",
    "email",
    "emailVerifiedAt",
    "password",
    "fcmToken",
    "latitude",
    "longitude",
    "avatar",
    "created_at",
    "updated_at",
    "affiliatedUnivId"
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
