-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "courseName" TEXT NOT NULL,
    "classRoom" TEXT,
    "day" TEXT NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#bfdbfe',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ScheduleEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ScheduleEntry_userId_day_startMinute_endMinute_idx" ON "ScheduleEntry"("userId", "day", "startMinute", "endMinute");
