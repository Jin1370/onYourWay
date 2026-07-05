"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function wishProduct(productId: number) {
    const session = await getSession();
    if (!session.id) {
        return;
    }
    // 중복 클릭(이미 찜한 상태)에도 500이 나지 않도록 멱등 처리.
    try {
        await db.wish.create({
            data: {
                productId,
                userId: session.id,
            },
        });
    } catch {
        // 이미 찜한 상태 — 무시(멱등)
    }
    revalidatePath(`/products/${productId}`);
}
export async function unWishProduct(productId: number) {
    const session = await getSession();
    if (!session.id) {
        return;
    }
    // deleteMany는 대상이 없어도 에러를 던지지 않아 중복 클릭에 안전하다.
    await db.wish.deleteMany({
        where: {
            productId,
            userId: session.id,
        },
    });
    revalidatePath(`/products/${productId}`);
}
