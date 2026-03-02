import db from "@/lib/db";
import getSession from "@/lib/session";
import { NextResponse } from "next/server";

async function getChatRoomsSummary(userId: number) {
    const chatRooms = await db.chatRoom.findMany({
        where: {
            members: {
                some: {
                    userId,
                },
            },
        },
        select: {
            id: true,
            type: true,
            university: {
                select: {
                    name: true,
                },
            },
            members: {
                select: {
                    last_read_at: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                },
            },
            messages: {
                take: 1,
                orderBy: {
                    created_at: "desc",
                },
                select: {
                    content: true,
                    created_at: true,
                },
            },
        },
    });

    const chatRoomsWithUnreadCount = await Promise.all(
        chatRooms.map(async (chatRoom) => {
            const myMember = chatRoom.members.find(
                (member) => member.user.id === userId,
            );
            const lastReadAt = myMember?.last_read_at ?? new Date(0);
            const unreadCount = await db.message.count({
                where: {
                    chatRoomId: chatRoom.id,
                    userId: {
                        not: userId,
                    },
                    created_at: {
                        gt: lastReadAt,
                    },
                },
            });
            return {
                ...chatRoom,
                unreadCount,
            };
        }),
    );

    return chatRoomsWithUnreadCount;
}

export async function GET() {
    const session = await getSession();
    if (!session.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatRooms = await getChatRoomsSummary(session.id);
    return NextResponse.json({ chatRooms });
}
