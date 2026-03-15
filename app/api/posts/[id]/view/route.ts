import db from "@/lib/db";
import getSession from "@/lib/session";
import { NextResponse } from "next/server";

const VIEW_WINDOW_MS = 30 * 60 * 1000;

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const postId = Number(id);
    if (!Number.isFinite(postId)) {
        return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session.id) {
        return NextResponse.json({ ok: true });
    }
    const userId = session.id;

    const now = new Date();

    await db.$transaction(async (tx) => {
        const existing = await tx.postView.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        if (!existing) {
            await tx.postView.create({
                data: {
                    userId,
                    postId,
                    lastViewedAt: now,
                },
            });
            await tx.post.update({
                where: { id: postId },
                data: { views: { increment: 1 } },
            });
            return;
        }

        if (now.getTime() - existing.lastViewedAt.getTime() >= VIEW_WINDOW_MS) {
            await tx.postView.update({
                where: { userId_postId: { userId, postId } },
                data: { lastViewedAt: now },
            });
            await tx.post.update({
                where: { id: postId },
                data: { views: { increment: 1 } },
            });
        }
    });

    return NextResponse.json({ ok: true });
}
