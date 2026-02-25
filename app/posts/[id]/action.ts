"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function likePost(postId: number) {
    const session = await getSession();
    await db.like.create({
        data: {
            postId,
            userId: session.id!,
        },
    });
    revalidatePath(`/posts/${postId}`);
}
export async function dislikePost(postId: number) {
    const session = await getSession();
    await db.like.delete({
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
    await db.comment.create({
        data: {
            content,
            userId: session.id!,
            postId,
        },
    });
    revalidatePath(`/posts/${postId}`);
}
export async function deleteComment(postId: number, commentId: number) {
    await db.comment.delete({
        where: {
            id: commentId,
        },
    });
    revalidatePath(`/posts/${postId}`);
}
