"use client";

import { formatToTimeAgo } from "@/lib/utils";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const SUPABASE_URL = "https://xvhlzzgnlvjssyftujvh.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_J-MWCPiI_DmRYAchyzYo8Q_5xxPYQP7";

interface ChatRoomSummary {
    id: string;
    type: string;
    university: {
        name: string | null;
    } | null;
    members: {
        last_read_at: string | Date;
        user: {
            id: number;
            username: string;
            avatar: string | null;
        };
    }[];
    messages: {
        content: string;
        created_at: string | Date;
    }[];
    unreadCount: number;
}

interface ChatsListProps {
    initialChatRooms: ChatRoomSummary[];
    userId: number;
}

export default function ChatsList({
    initialChatRooms,
    userId,
}: ChatsListProps) {
    const [chatRooms, setChatRooms] = useState(initialChatRooms);

    const roomIds = useMemo(
        () => chatRooms.map((room) => room.id),
        [chatRooms],
    );

    const refreshChatRooms = useCallback(async () => {
        const response = await fetch("/api/chats/summary", {
            method: "GET",
            cache: "no-store",
        });
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        setChatRooms(data.chatRooms ?? []);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            void refreshChatRooms();
        }, 0);
        return () => clearTimeout(timer);
    }, [refreshChatRooms]);

    useEffect(() => {
        const onFocus = () => {
            refreshChatRooms();
        };
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                refreshChatRooms();
            }
        };
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            window.removeEventListener("focus", onFocus);
            document.removeEventListener(
                "visibilitychange",
                onVisibilityChange,
            );
        };
    }, [refreshChatRooms]);

    useEffect(() => {
        const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
        const channels: RealtimeChannel[] = [];

        roomIds.forEach((roomId) => {
            const channel = client.channel(`room-${roomId}`);
            channel
                .on("broadcast", { event: "message" }, () => {
                    refreshChatRooms();
                })
                .subscribe();
            channels.push(channel);
        });

        return () => {
            channels.forEach((channel) => {
                channel.unsubscribe();
            });
        };
    }, [refreshChatRooms, roomIds]);

    return (
        <>
            {chatRooms.map((chatRoom) => {
                const otherMembers = chatRoom.members
                    .filter((m) => m.user.id !== userId)
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
                                <div className="size-9 rounded-full  flex items-center justify-center bg-blue-100 text-white font-bold text-lg shrink-0">
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
                                    className="size-9 rounded-full object-cover shrink-0"
                                />
                            )}
                            <div className="flex flex-col flex-1 min-w-0">
                                <h2 className="font-semibold text-lg line-clamp-1 break-all">
                                    {roomTitle}
                                    {chatRoom.type === "DIRECT" &&
                                    participantsNum > 1
                                        ? ` 외 ${participantsNum - 1}명`
                                        : chatRoom.type === "UNIVERSITY"
                                          ? ` (${participantsNum + 1})`
                                          : null}
                                </h2>
                                <div className="flex justify-between items-center w-full gap-3 text-mygray">
                                    <span className="line-clamp-1 break-all">
                                        {chatRoom.messages[0]?.content ||
                                            "새로운 채팅방이 생성되었습니다."}
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {chatRoom.unreadCount > 0 ? (
                                            <span className="min-w-5 h-5 px-1 rounded-full bg-sky-500 text-white text-xs font-semibold flex items-center justify-center">
                                                {chatRoom.unreadCount > 99
                                                    ? "99+"
                                                    : chatRoom.unreadCount}
                                            </span>
                                        ) : null}
                                        {chatRoom.messages[0] && (
                                            <span className="text-sm">
                                                {formatToTimeAgo(
                                                    chatRoom.messages[0].created_at.toString(),
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </>
    );
}
