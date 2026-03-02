import db from "@/lib/db";
import getSession from "@/lib/session";
import ChatNotificationConsent from "@/components/chat-notification-consent";
import ChatsList from "./chats-list";

async function getChatRooms(userId: number) {
    const chatRooms = await db.chatRoom.findMany({
        where: {
            members: {
                some: {
                    userId,
                },
            },
        },
        orderBy: {
            created_at: "desc",
        },
        select: {
            id: true,
            created_at: true,
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
    return chatRoomsWithUnreadCount.sort((a, b) => {
        const aTime = new Date(
            a.messages[0]?.created_at ?? a.created_at,
        ).getTime();
        const bTime = new Date(
            b.messages[0]?.created_at ?? b.created_at,
        ).getTime();
        return bTime - aTime;
    });
}

export default async function ChatRooms() {
    const session = await getSession();
    const chatRooms = await getChatRooms(session.id!);
    return (
        <div className="flex flex-col p-5 pb-20">
            <ChatNotificationConsent />
            <ChatsList initialChatRooms={chatRooms} userId={session.id!} />
        </div>
    );
}
