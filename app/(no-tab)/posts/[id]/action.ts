"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function likePost(postId: number) {
    const session = await getSession();
    if (!session.id) {
        return;
    }
    // 좋아요 UI는 클라이언트에서 낙관적으로 처리하므로 revalidatePath로 페이지 전체를
    // 새로고침하지 않는다. 중복 클릭(이미 좋아요 상태)은 무시해 500 에러를 막는다.
    try {
        await db.postLike.create({
            data: {
                postId,
                userId: session.id,
            },
        });
    } catch {
        // 이미 좋아요를 누른 상태 — 무시(멱등)
    }
}
export async function dislikePost(postId: number) {
    const session = await getSession();
    if (!session.id) {
        return;
    }
    // deleteMany는 대상이 없어도 에러를 던지지 않아 중복 클릭에 안전하다.
    await db.postLike.deleteMany({
        where: {
            postId,
            userId: session.id,
        },
    });
}

export async function createComment(postId: number, formData: FormData) {
    const content = formData.get("comment");
    if (!content || typeof content !== "string") {
        return;
    }
    const session = await getSession();
    if (!session.id) {
        return;
    }
    await db.postComment.create({
        data: {
            content,
            userId: session.id,
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

    // where에 userId를 포함해 본인 댓글만 삭제하고, deleteMany로 중복 삭제(P2025)에도 안전하게.
    await db.postComment.deleteMany({
        where: {
            id: commentId,
            userId: session.id,
        },
    });
    revalidatePath(`/posts/${postId}`);
}

export async function likeComment(postId: number, commentId: number) {
    const session = await getSession();
    if (!session.id) {
        return;
    }
    // 댓글 좋아요도 클라이언트 낙관적 처리 — 전체 새로고침 없이 멱등 처리.
    try {
        await db.postCommentLike.create({
            data: {
                commentId,
                userId: session.id,
            },
        });
    } catch {
        // 이미 좋아요를 누른 상태 — 무시(멱등)
    }
}

export async function dislikeComment(postId: number, commentId: number) {
    const session = await getSession();
    if (!session.id) {
        return;
    }
    await db.postCommentLike.deleteMany({
        where: {
            commentId,
            userId: session.id,
        },
    });
}
