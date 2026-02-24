"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";

export async function saveMessage(content: string, chatRoomId: string) {
    const session = await getSession();
    await db.messages.create({
        data: {
            content,
            userId: session.id!,
            chatRoomId,
        },
    });
}
