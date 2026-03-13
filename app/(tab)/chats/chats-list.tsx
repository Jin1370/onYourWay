"use client";

import { getSupabaseClient } from "@/lib/supabase-client";
import { formatToTimeAgo } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import { RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ChatRoomSummary {
    id: string;
    type: string;
    product: {
        title: string;
    } | null;
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
            void refreshChatRooms();
        };
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void refreshChatRooms();
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
        const client = getSupabaseClient();
        const channels: RealtimeChannel[] = [];

        roomIds.forEach((roomId) => {
            const channel = client.channel(`room-${roomId}`);
            channel
                .on("broadcast", { event: "message" }, () => {
                    void refreshChatRooms();
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
            {chatRooms.length === 0 ? (
                <p className="pt-3 text-center text-sm text-neutral-500">
                    채팅방이 존재하지 않습니다.
                </p>
            ) : null}
            {chatRooms.map((chatRoom) => {
                const otherMembers = chatRoom.members
                    .filter((m) => m.user.id !== userId)
                    .map((m) => m.user);
                const firstOpponent = otherMembers[0];
                const participantsNum = otherMembers.length;
                const roomTitle =
                    chatRoom.type === "UNIVERSITY"
                        ? `${chatRoom.university?.name}`
                        : `${firstOpponent?.username || "(알 수 없음)"}${chatRoom.product?.title ? ` (${chatRoom.product.title})` : ""}`;

                return (
                    <Link
                        key={chatRoom.id}
                        href={`/chats/${chatRoom.id}`}
                        className="mb-5 flex flex-col border-b border-neutral-200 pb-5 text-neutral-700 last:border-b-0 last:pb-0"
                    >
                        <div className="flex items-center gap-5">
                            {chatRoom.type === "UNIVERSITY" ? (
                                <div className="size-9 shrink-0 rounded-full bg-blue-100 text-lg font-bold text-white flex items-center justify-center">
                                    🌍
                                </div>
                            ) : (
                                <Image
                                    src={
                                        firstOpponent?.avatar ||
                                        "https://blocks.astratic.com/img/user-img-small.png"
                                    }
                                    alt={roomTitle}
                                    width={50}
                                    height={50}
                                    className="size-9 shrink-0 rounded-full object-cover"
                                />
                            )}
                            <div className="flex min-w-0 flex-1 flex-col">
                                <h2 className="line-clamp-1 break-all font-semibold">
                                    {roomTitle}
                                    {chatRoom.type === "UNIVERSITY" ? (
                                        <span className="ml-2 inline-flex items-center gap-0.5 text-sm text-neutral-400">
                                            <UserIcon className="size-3.5" />
                                            {participantsNum + 1}
                                        </span>
                                    ) : null}
                                </h2>
                                <div className="flex w-full items-center justify-between gap-3 text-mygray">
                                    <span className="line-clamp-1 break-all">
                                        {chatRoom.messages[0]?.content ||
                                            "아직 채팅 내용이 없습니다."}
                                    </span>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {chatRoom.unreadCount > 0 ? (
                                            <span className="min-w-5 h-5 px-1 rounded-full bg-sky-500 text-white text-xs font-semibold flex items-center justify-center">
                                                {chatRoom.unreadCount > 99
                                                    ? "99+"
                                                    : chatRoom.unreadCount}
                                            </span>
                                        ) : null}
                                        {chatRoom.messages[0] ? (
                                            <span className="text-sm">
                                                {formatToTimeAgo(
                                                    chatRoom.messages[0].created_at.toString(),
                                                )}
                                            </span>
                                        ) : null}
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
