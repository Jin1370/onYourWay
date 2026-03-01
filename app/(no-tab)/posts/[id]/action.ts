"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function likePost(postId: number) {
    const session = await getSession();
    await db.postLike.create({
        data: {
            postId,
            userId: session.id!,
        },
    });
    revalidatePath(`/posts/${postId}`);
}
export async function dislikePost(postId: number) {
    const session = await getSession();
    await db.postLike.delete({
        where: {
            id: {
                postId,
                userId: session.id!,
            },
        },
    });
    revalidatePath(`/posts/${postId}`);
}

export async function createComment(postId: number, formData: FormData) {
    const content = formData.get("comment");
    if (!content || typeof content !== "string") {
        return;
    }
    const session = await getSession();
    await db.postComment.create({
        data: {
            content,
            userId: session.id!,
            postId,
        },
    });
    revalidatePath(`/posts/${postId}`);
}
export async function deleteComment(postId: number, commentId: number) {
    const session = await getSession();
    if (!session.id) {
        return;
    }

    const comment = await db.postComment.findUnique({
        where: {
            id: commentId,
        },
        select: {
            userId: true,
        },
    });

    if (!comment || comment.userId !== session.id) {
        return;
    }

    await db.postComment.delete({
        where: {
            id: commentId,
        },
    });
    revalidatePath(`/posts/${postId}`);
}
