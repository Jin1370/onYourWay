"use client";

import { getSupabaseClient } from "@/lib/supabase-client";
import { formatToTimeAgo } from "@/lib/utils";
import { SpeakerXMarkIcon } from "@heroicons/react/24/solid";
import { UserIcon } from "@heroicons/react/24/solid";
import { RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
        is_muted: boolean;
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
    keyword?: string;
}

export default function ChatsList({
    initialChatRooms,
    userId,
    keyword = "",
}: ChatsListProps) {
    const [chatRooms, setChatRooms] = useState(initialChatRooms);
    const [deleteTargetRoomId, setDeleteTargetRoomId] = useState<string | null>(
        null,
    );
    const [leaveTargetRoomId, setLeaveTargetRoomId] = useState<string | null>(
        null,
    );
    const [menuState, setMenuState] = useState<{
        roomId: string;
        x: number;
        y: number;
    } | null>(null);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const isLongPressTriggeredRef = useRef(false);

    const roomIds = useMemo(
        () => chatRooms.map((room) => room.id),
        [chatRooms],
    );
    const normalizedKeyword = keyword.trim().toLowerCase();

    const getRoomTitle = useCallback(
        (chatRoom: ChatRoomSummary) => {
            const otherMembers = chatRoom.members
                .filter((member) => member.user.id !== userId)
                .map((member) => member.user);
            const firstOpponent = otherMembers[0];
            return chatRoom.type === "UNIVERSITY"
                ? `${chatRoom.university?.name ?? ""}`
                : `${firstOpponent?.username || "(알 수 없음)"}${chatRoom.product?.title ? ` (${chatRoom.product.title})` : ""}`;
        },
        [userId],
    );

    const filteredChatRooms = useMemo(() => {
        if (!normalizedKeyword) return chatRooms;
        return chatRooms.filter((chatRoom) =>
            getRoomTitle(chatRoom).toLowerCase().includes(normalizedKeyword),
        );
    }, [chatRooms, getRoomTitle, normalizedKeyword]);
    const selectedRoom = useMemo(
        () => chatRooms.find((room) => room.id === menuState?.roomId) ?? null,
        [chatRooms, menuState?.roomId],
    );
    const isSelectedRoomMuted = useMemo(() => {
        if (!selectedRoom) return false;
        const myMember = selectedRoom.members.find(
            (member) => member.user.id === userId,
        );
        return Boolean(myMember?.is_muted);
    }, [selectedRoom, userId]);

    const closeMenu = useCallback(() => {
        setMenuState(null);
    }, []);

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
        const intervalId = setInterval(() => {
            void refreshChatRooms();
        }, 5000);
        return () => clearInterval(intervalId);
    }, [refreshChatRooms]);

    useEffect(() => {
        if (!menuState) return;
        const close = () => closeMenu();
        window.addEventListener("click", close);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
        return () => {
            window.removeEventListener("click", close);
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [closeMenu, menuState]);

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

    const clearLongPressTimer = () => {
        if (!longPressTimerRef.current) return;
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    };

    const openContextMenu = (
        roomId: string,
        clientX: number,
        clientY: number,
    ) => {
        setMenuState({
            roomId,
            x: clientX,
            y: clientY,
        });
    };

    const handlePointerDown = (
        roomId: string,
        event: React.PointerEvent<HTMLAnchorElement>,
    ) => {
        if (event.pointerType !== "touch") return;
        isLongPressTriggeredRef.current = false;
        clearLongPressTimer();
        const { clientX, clientY } = event;
        longPressTimerRef.current = setTimeout(() => {
            isLongPressTriggeredRef.current = true;
            openContextMenu(roomId, clientX, clientY);
        }, 600);
    };

    const handlePointerUp = () => {
        clearLongPressTimer();
    };

    const handlePointerCancel = () => {
        clearLongPressTimer();
    };

    const handleContextMenu = (
        roomId: string,
        event: React.MouseEvent<HTMLAnchorElement>,
    ) => {
        event.preventDefault();
        openContextMenu(roomId, event.clientX, event.clientY);
    };

    const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (isLongPressTriggeredRef.current) {
            event.preventDefault();
            isLongPressTriggeredRef.current = false;
        }
    };

    const toggleMute = async () => {
        if (!selectedRoom) return;
        const response = await fetch(
            `/api/chats/${selectedRoom.id}/membership`,
            {
                method: "PATCH",
            },
        );
        if (!response.ok) {
            alert("알림 설정 변경에 실패했습니다.");
            return;
        }
        closeMenu();
        await refreshChatRooms();
    };

    const openDeleteModal = () => {
        if (!selectedRoom) return;
        setDeleteTargetRoomId(selectedRoom.id);
        closeMenu();
    };

    const deleteChatRoom = async () => {
        if (!deleteTargetRoomId) return;
        const response = await fetch(
            `/api/chats/${deleteTargetRoomId}/membership`,
            {
                method: "DELETE",
            },
        );
        if (!response.ok) {
            alert("채팅방 삭제에 실패했습니다.");
            return;
        }
        setDeleteTargetRoomId(null);
        await refreshChatRooms();
    };

    const openLeaveModal = () => {
        if (!selectedRoom) return;
        setLeaveTargetRoomId(selectedRoom.id);
        closeMenu();
    };

    const leaveChatRoom = async () => {
        if (!leaveTargetRoomId) return;
        const response = await fetch(
            `/api/chats/${leaveTargetRoomId}/membership/leave`,
            {
                method: "DELETE",
            },
        );
        if (!response.ok) {
            alert("채팅방 나가기에 실패했습니다.");
            return;
        }
        setLeaveTargetRoomId(null);
        await refreshChatRooms();
    };

    return (
        <>
            {filteredChatRooms.length === 0 ? (
                <p className="pt-3 text-center text-sm text-neutral-500">
                    채팅방이 존재하지 않습니다.
                </p>
            ) : null}
            {filteredChatRooms.map((chatRoom) => {
                const otherMembers = chatRoom.members
                    .filter((m) => m.user.id !== userId)
                    .map((m) => m.user);
                const myMember = chatRoom.members.find(
                    (member) => member.user.id === userId,
                );
                const isMuted = Boolean(myMember?.is_muted);
                const firstOpponent = otherMembers[0];
                const participantsNum = otherMembers.length;
                const roomTitle = getRoomTitle(chatRoom);

                return (
                    <Link
                        key={chatRoom.id}
                        href={`/chats/${chatRoom.id}`}
                        className="mb-5 flex flex-col border-b border-neutral-200 pb-5 text-neutral-700 last:border-b-0 last:pb-0"
                        onContextMenu={(event) =>
                            handleContextMenu(chatRoom.id, event)
                        }
                        onPointerDown={(event) =>
                            handlePointerDown(chatRoom.id, event)
                        }
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerCancel}
                        onPointerLeave={handlePointerCancel}
                        onClick={handleLinkClick}
                        style={{
                            touchAction: "manipulation",
                            WebkitUserSelect: "none",
                            userSelect: "none",
                        }}
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
                                <h2 className="line-clamp-1 break-all font-semibold flex items-center gap-1">
                                    <span className="line-clamp-1 break-all">
                                        {roomTitle}
                                    </span>
                                    {isMuted ? (
                                        <SpeakerXMarkIcon className="ml-1 size-4 shrink-0 text-neutral-400" />
                                    ) : null}
                                    {chatRoom.type === "UNIVERSITY" ? (
                                        <span className="ml-1 inline-flex items-center gap-0.5 text-sm text-neutral-400 shrink-0">
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
            {menuState ? (
                <div
                    className="fixed inset-0 z-50"
                    onClick={closeMenu}
                    onContextMenu={(event) => {
                        event.preventDefault();
                        closeMenu();
                    }}
                >
                    <div
                        className="absolute min-w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg"
                        style={{
                            left: Math.max(menuState.x - 140, 12),
                            top: Math.max(menuState.y - 12, 12),
                        }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="w-full px-4 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50"
                            onClick={toggleMute}
                        >
                            {isSelectedRoomMuted ? "알림 켜기" : "알림 끄기"}
                        </button>
                        <button
                            type="button"
                            className="w-full px-4 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50"
                            onClick={openDeleteModal}
                        >
                            목록에서 삭제
                        </button>
                        <button
                            type="button"
                            className="w-full border-t border-neutral-200 px-4 py-2 text-left text-sm text-red-600 hover:bg-neutral-50"
                            onClick={openLeaveModal}
                        >
                            채팅방 나가기
                        </button>
                    </div>
                </div>
            ) : null}
            {deleteTargetRoomId ? (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-center text-lg font-bold text-neutral-800">
                            목록에서 삭제
                        </h3>
                        <p className="mt-2 text-center text-sm text-neutral-500">
                            이 채팅방을 목록에서 삭제할까요?
                            <br />
                            상대방에게는 표시되지 않습니다.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTargetRoomId(null)}
                                className="flex-1 rounded-xl bg-neutral-100 py-3 font-semibold text-neutral-600 active:bg-neutral-200"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={deleteChatRoom}
                                className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white active:bg-red-600"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
            {leaveTargetRoomId ? (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-center text-lg font-bold text-neutral-800">
                            채팅방 나가기
                        </h3>
                        <p className="mt-2 text-center text-sm text-neutral-500">
                            정말로 채팅방을 나가시겠습니까?
                            <br />
                            상대에게는 (알 수 없음)으로 표시됩니다.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setLeaveTargetRoomId(null)}
                                className="flex-1 rounded-xl bg-neutral-100 py-3 font-semibold text-neutral-600 active:bg-neutral-200"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={leaveChatRoom}
                                className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white active:bg-red-600"
                            >
                                나가기
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
