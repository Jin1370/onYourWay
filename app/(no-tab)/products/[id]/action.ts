"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function wishProduct(productId: number) {
    const session = await getSession();
    await db.wish.create({
        data: {
            productId,
            userId: session.id!,
        },
    });
    revalidatePath(`/products/${productId}`);
}
export async function unWishProduct(productId: number) {
    const session = await getSession();
    await db.wish.delete({
        where: {
            id: {
                productId,
                userId: session.id!,
            },
        },
    });
    revalidatePath(`/products/${productId}`);
}
