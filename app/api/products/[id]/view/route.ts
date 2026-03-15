import db from "@/lib/db";
import getSession from "@/lib/session";
import { NextResponse } from "next/server";

const VIEW_WINDOW_MS = 30 * 60 * 1000;

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isFinite(productId)) {
        return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }

    const session = await getSession();
    if (!session.id) {
        return NextResponse.json({ ok: true });
    }
    const userId = session.id;

    const now = new Date();

    await db.$transaction(async (tx) => {
        const existing = await tx.productView.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (!existing) {
            await tx.productView.create({
                data: {
                    userId,
                    productId,
                    lastViewedAt: now,
                },
            });
            await tx.product.update({
                where: { id: productId },
                data: { views: { increment: 1 } },
            });
            return;
        }

        if (now.getTime() - existing.lastViewedAt.getTime() >= VIEW_WINDOW_MS) {
            await tx.productView.update({
                where: { userId_productId: { userId, productId } },
                data: { lastViewedAt: now },
            });
            await tx.product.update({
                where: { id: productId },
                data: { views: { increment: 1 } },
            });
        }
    });

    return NextResponse.json({ ok: true });
}
