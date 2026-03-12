"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const locationSchema = z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
});

export async function saveBuyerLocation(_prevState: unknown, formData: FormData) {
    const session = await getSession();
    if (!session.id) {
        return {
            fieldErrors: {
                latitude: [] as string[],
                longitude: [] as string[],
            },
            formErrors: ["로그인이 필요합니다."],
        };
    }

    const parsed = locationSchema.safeParse({
        latitude: formData.get("latitude"),
        longitude: formData.get("longitude"),
    });

    if (!parsed.success) {
        return parsed.error.flatten();
    }

    await db.user.update({
        where: {
            id: session.id,
        },
        data: {
            latitude: parsed.data.latitude,
            longitude: parsed.data.longitude,
        },
    });

    revalidatePath("/products");
    redirect("/products");
}
