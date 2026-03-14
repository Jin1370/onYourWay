-- CreateTable
CREATE TABLE "PostCommentLike" (
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,

    PRIMARY KEY ("userId", "commentId"),
    CONSTRAINT "PostCommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostCommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "PostComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
