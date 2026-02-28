import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToTimeAgo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

async function getChatRooms(userId: number) {
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
    return chatRooms;
}

export default async function ChatRooms() {
    const session = await getSession();
    const chatRooms = await getChatRooms(session.id!);
    return (
        <div className="flex flex-col p-5 pb-20">
            {chatRooms.map((chatRoom) => {
                const otherMembers = chatRoom.members
                    .filter((m) => m.user.id !== session.id)
                    .map((m) => m.user);
                const firstOpponent = otherMembers[0];
                const participantsNum = otherMembers.length;
                const roomTitle =
                    chatRoom.type === "UNIVERSITY"
                        ? `${chatRoom.university?.name}`
                        : firstOpponent?.username || "(대화상대없음)";

                return (
                    <Link
                        key={chatRoom.id}
                        href={`/chats/${chatRoom.id}`}
                        className="pb-5 mb-5 border-b border-neutral-300 text-neutral-700 flex flex-col last:border-b-0 last:pb-0"
                    >
                        <div className="flex items-center gap-5">
                            {chatRoom.type === "UNIVERSITY" ? (
                                <div className="size-9 rounded-full  flex items-center justify-center bg-blue-100 text-white font-bold text-lg">
                                    🏛️
                                </div>
                            ) : (
                                <Image
                                    src={
                                        firstOpponent?.avatar ||
                                        "/default-avatar.png"
                                    }
                                    alt={roomTitle}
                                    width={50}
                                    height={50}
                                    className="size-9 rounded-full object-cover"
                                />
                            )}
                            <div className="flex flex-col flex-1">
                                <h2 className="font-semibold text-lg">
                                    {roomTitle}
                                    {chatRoom.type === "DIRECT" &&
                                    participantsNum > 1
                                        ? ` 외 ${participantsNum - 1}명`
                                        : chatRoom.type === "UNIVERSITY"
                                          ? ` (${participantsNum + 1})`
                                          : null}
                                </h2>
                                <div className="flex justify-between">
                                    <span className="line-clamp-1 pr-5">
                                        {chatRoom.messages[0]?.content ||
                                            "새로운 채팅방이 생성되었습니다."}
                                    </span>
                                    {chatRoom.messages[0] && (
                                        <span className="text-sm shrink-0">
                                            {formatToTimeAgo(
                                                chatRoom.messages[0].created_at.toString(),
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
