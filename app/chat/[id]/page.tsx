import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound } from "next/navigation";
import ChatMessagesList from "../chat-messages-list";

async function getChatRoom(chatRoomId: string) {
    const chatRoom = await db.chatRooms.findUnique({
        where: {
            id: chatRoomId,
        },
        include: {
            users: {
                select: { id: true },
            },
        },
    });
    if (chatRoom) {
        const session = await getSession();
        const canSee = Boolean(
            chatRoom.users.find((user) => user.id === session.id),
        );
        if (!canSee) return null;
    }
    return chatRoom;
}

async function getMessages(chatRoomId: string) {
    const messages = await db.messages.findMany({
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
    const user = await getUserProfile();
    if (!user) {
        return notFound();
    }
    return (
        <ChatMessagesList
            chatRoomId={id}
            userId={session.id!}
            username={user.username}
            avatar={user.avatar!}
            initialMessages={initialMessages}
        />
    );
}
