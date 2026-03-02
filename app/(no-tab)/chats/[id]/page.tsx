import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound } from "next/navigation";
import ChatMessagesList from "../chat-messages-list";
import ChatNotificationConsent from "@/components/chat-notification-consent";

async function getChatRoom(chatRoomId: string) {
    const chatRoom = await db.chatRoom.findUnique({
        where: {
            id: chatRoomId,
        },
        include: {
            members: {
                select: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                },
            },
            university: {
                select: {
                    name: true,
                },
            },
        },
    });
    if (chatRoom) {
        const session = await getSession();
        const canSee = Boolean(
            chatRoom.members.find((member) => member.user.id === session.id),
        );
        if (!canSee) {
            return null;
        }
    }
    return chatRoom;
}

async function getMessages(chatRoomId: string) {
    const messages = await db.message.findMany({
        where: {
            chatRoomId,
        },
        select: {
            id: true,
            content: true,
            created_at: true,
            userId: true,
            user: {
                select: {
                    avatar: true,
                    username: true,
                },
            },
        },
    });
    return messages;
}

async function markAsRead(chatRoomId: string, userId: number) {
    await db.chatRoomMember.updateMany({
        where: {
            chatRoomId,
            userId,
        },
        data: {
            last_read_at: new Date(),
        },
    });
}

async function getUserProfile() {
    const session = await getSession();
    const user = await db.user.findUnique({
        where: {
            id: session.id,
        },
        select: {
            username: true,
            avatar: true,
        },
    });
    return user;
}

export type InitialMessages = Awaited<ReturnType<typeof getMessages>>;

export default async function Chat({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const chatRoom = await getChatRoom(id);
    if (!chatRoom) {
        return notFound();
    }
    const initialMessages = await getMessages(chatRoom.id);
    const session = await getSession();
    await markAsRead(chatRoom.id, session.id!);
    const user = await getUserProfile();
    if (!user) {
        return notFound();
    }
    //참여자 명단을 members에서 추출하여 전달
    const participants = chatRoom.members.map((member) => member.user);
    return (
        <>
            <ChatNotificationConsent />
            <ChatMessagesList
                chatRoomId={id}
                participants={participants}
                userId={session.id!}
                username={user.username}
                avatar={user.avatar!}
                initialMessages={initialMessages}
                chatRoomType={chatRoom.type}
                universityName={chatRoom.university?.name}
            />
        </>
    );
}
