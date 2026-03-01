"use server";

import db from "@/lib/db";
import { messaging } from "@/lib/firebase-admin";
import getSession from "@/lib/session";

export async function saveMessage(content: string, chatRoomId: string) {
    const session = await getSession();
    if (!session.id) {
        return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
        return;
    }

    const chatRoom = await db.chatRoom.findFirst({
        where: {
            id: chatRoomId,
            members: {
                some: {
                    userId: session.id,
                },
            },
        },
        select: {
            type: true,
            university: {
                select: {
                    name: true,
                },
            },
            members: {
                where: {
                    userId: {
                        not: session.id,
                    },
                    is_muted: false,
                },
                select: {
                    user: {
                        select: {
                            fcmToken: true,
                        },
                    },
                },
            },
        },
    });

    if (!chatRoom) {
        return;
    }

    const sender = await db.user.findUnique({
        where: {
            id: session.id,
        },
        select: {
            username: true,
        },
    });

    await db.message.create({
        data: {
            content: trimmedContent,
            userId: session.id!,
            chatRoomId,
        },
    });

    const tokens = chatRoom.members
        .map((member) => member.user.fcmToken)
        .filter((token): token is string => Boolean(token));
    if (tokens.length === 0) {
        return;
    }

    const title =
        chatRoom.type === "UNIVERSITY" && chatRoom.university?.name
            ? `${chatRoom.university.name} 채팅`
            : `${sender?.username ?? "사용자"}님 메시지`;

    try {
        await messaging.sendEachForMulticast({
            tokens,
            data: {
                title,
                body: trimmedContent.slice(0, 120),
                chatRoomId,
            },
        });
    } catch (error) {
        console.error("Failed to send chat push notification:", error);
    }
}
