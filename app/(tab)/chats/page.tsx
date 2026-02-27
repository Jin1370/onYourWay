import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToTimeAgo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

async function getChatRooms(userId: number) {
    const chatRooms = await db.chatRoom.findMany({
        where: {
            users: {
                some: {
                    id: userId,
                },
            },
        },
        select: {
            id: true,
            users: {
                select: {
                    id: true,
                    username: true,
                    avatar: true,
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
                const firstOpponent = chatRoom.users.find(
                    (user) => user.id !== session.id,
                );
                const participantsNum = chatRoom.users.length - 1;
                return (
                    <Link
                        key={chatRoom.id}
                        href={`/chats/${chatRoom.id}`}
                        className="pb-5 mb-5 border-b border-neutral-300 text-neutral-700 flex flex-col last:border-b-0 last:pb-0"
                    >
                        <div className="flex items-center gap-5">
                            {firstOpponent ? (
                                <Image
                                    src={
                                        firstOpponent.avatar ||
                                        "/default-avatar.png"
                                    }
                                    alt={firstOpponent.username}
                                    width={50}
                                    height={50}
                                    className="size-9 rounded-full"
                                />
                            ) : (
                                <Image
                                    src={"/default-avatar.png"}
                                    alt="기본프로필"
                                    width={50}
                                    height={50}
                                    className="size-9 rounded-full"
                                />
                            )}
                            <div className="flex flex-col flex-1">
                                {firstOpponent ? (
                                    <h2 className="font-semibold text-lg">
                                        {firstOpponent.username}
                                        {participantsNum > 1
                                            ? ` 외 ${participantsNum}명`
                                            : null}
                                    </h2>
                                ) : (
                                    <h2 className="font-semibold text-lg">
                                        (대화 상대 없음)
                                    </h2>
                                )}
                                <div className="flex justify-between">
                                    <span className="line-clamp-1 pr-5">
                                        {chatRoom.messages[0].content}
                                    </span>
                                    <span className="text-sm shrink-0">
                                        {formatToTimeAgo(
                                            chatRoom.messages[0].created_at.toString(),
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
