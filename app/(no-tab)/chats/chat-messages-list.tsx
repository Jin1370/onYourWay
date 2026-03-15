"use client";

import { getSupabaseClient } from "@/lib/supabase-client";
import { formatDate, formatTime } from "@/lib/utils";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { ArrowUpCircleIcon, UserIcon } from "@heroicons/react/24/solid";
import { RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { markAsRead, saveMessage } from "./action";
import { InitialMessages } from "./[id]/page";

interface ChatMessageListProps {
    chatRoomId: string;
    participants: {
        id: number;
        username: string;
        avatar: string | null;
        last_read_at: string | Date;
        is_muted: boolean;
    }[];
    userId: number;
    username: string;
    avatar: string;
    initialMessages: InitialMessages;
    chatRoomType: string;
    universityName?: string;
    productTitle?: string;
}

export default function ChatMessagesList({
    chatRoomId,
    participants,
    userId,
    username,
    avatar,
    initialMessages,
    chatRoomType,
    universityName,
    productTitle,
}: ChatMessageListProps) {
    const router = useRouter();
    const [messages, setMessages] = useState(initialMessages);
    const [message, setMessage] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [participantReadAt, setParticipantReadAt] = useState<
        Record<number, string>
    >(
        participants.reduce<Record<number, string>>((acc, participant) => {
            acc[participant.id] = new Date(
                participant.last_read_at,
            ).toISOString();
            return acc;
        }, {}),
    );
    const myParticipant = participants.find(
        (participant) => participant.id === userId,
    );
    const [isMuted, setIsMuted] = useState(Boolean(myParticipant?.is_muted));

    const channel = useRef<RealtimeChannel>(null);

    const sendReadReceipt = useCallback(async () => {
        const readAt = new Date().toISOString();
        try {
            await markAsRead(chatRoomId);
        } catch (error) {
            console.error("Failed to mark messages as read:", error);
        }
        channel.current?.send({
            type: "broadcast",
            event: "read",
            payload: {
                userId,
                readAt,
            },
        });
    }, [chatRoomId, userId]);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        if (!message.trim()) return;

        const newMessage = {
            id: Date.now(),
            content: message,
            created_at: new Date(),
            userId,
            user: {
                username,
                avatar,
            },
        };

        setMessages((prevMsgs) => [...prevMsgs, newMessage]);

        await saveMessage(message, chatRoomId);

        channel.current?.send({
            type: "broadcast",
            event: "message",
            payload: newMessage,
        });

        setMessage("");
    };

    useEffect(() => {
        const client = getSupabaseClient();
        channel.current = client.channel(`room-${chatRoomId}`);
        channel.current
            .on("broadcast", { event: "message" }, (payload) => {
                setMessages((prevMsgs) => [...prevMsgs, payload.payload]);
                const senderId = Number(payload.payload?.userId);
                if (senderId && senderId !== userId) {
                    void sendReadReceipt();
                }
            })
            .on("broadcast", { event: "read" }, (payload) => {
                const payloadUserId = Number(payload.payload?.userId);
                const payloadReadAt = payload.payload?.readAt;
                if (!payloadUserId || typeof payloadReadAt !== "string") return;
                setParticipantReadAt((prev) => {
                    const prevReadAt = prev[payloadUserId];
                    if (
                        prevReadAt &&
                        new Date(prevReadAt).getTime() >=
                            new Date(payloadReadAt).getTime()
                    ) {
                        return prev;
                    }
                    return {
                        ...prev,
                        [payloadUserId]: payloadReadAt,
                    };
                });
            })
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    void sendReadReceipt();
                }
            });

        return () => {
            channel.current?.unsubscribe();
        };
    }, [chatRoomId, sendReadReceipt, userId]);

    const scrollEndRef = useRef<HTMLDivElement>(null);
    const didInitialScrollRef = useRef(false);

    useEffect(() => {
        if (!didInitialScrollRef.current) {
            didInitialScrollRef.current = true;
            scrollEndRef.current?.scrollIntoView({ behavior: "auto" });
            return;
        }
        scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const otherParticipants = participants.filter((user) => user.id !== userId);
    const firstOpponent = otherParticipants[0];

    const headerTitle =
        chatRoomType === "UNIVERSITY"
            ? `${universityName}`
            : `${firstOpponent?.username || "(알 수 없는 상대)"}${productTitle ? ` (${productTitle})` : ""}`;

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const isGroupChat =
        chatRoomType === "UNIVERSITY" || participants.length > 2;
    const readCountsByIndex = messages.map((msg) => {
        const messageCreatedAt = new Date(msg.created_at).getTime();
        return participants.filter((participant) => {
            if (participant.id === msg.userId) return false;
            const readAt = participantReadAt[participant.id];
            if (!readAt) return false;
            return new Date(readAt).getTime() >= messageCreatedAt;
        }).length;
    });

    let lastOtherMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].userId !== userId) {
            lastOtherMessageIndex = i;
            break;
        }
    }

    let readLabelTargetIndex = -1;
    for (let i = messages.length - 1; i > lastOtherMessageIndex; i--) {
        if (messages[i].userId === userId && readCountsByIndex[i] > 0) {
            readLabelTargetIndex = i;
            break;
        }
    }

    const toggleMute = async () => {
        const response = await fetch(`/api/chats/${chatRoomId}/membership`, {
            method: "PATCH",
        });
        if (!response.ok) {
            alert("알림 설정 변경에 실패했습니다.");
            return;
        }
        const data = await response.json();
        setIsMuted(Boolean(data.isMuted));
    };

    const deleteChatRoomFromList = async () => {
        const response = await fetch(`/api/chats/${chatRoomId}/membership`, {
            method: "DELETE",
        });
        if (!response.ok) {
            alert("목록에서 삭제에 실패했습니다.");
            return;
        }
        setIsDeleteModalOpen(false);
        setIsMenuOpen(false);
        router.push("/chats");
    };

    const leaveChatRoom = async () => {
        const response = await fetch(
            `/api/chats/${chatRoomId}/membership/leave`,
            {
                method: "DELETE",
            },
        );
        if (!response.ok) {
            alert("채팅방 나가기에 실패했습니다.");
            return;
        }
        setIsLeaveModalOpen(false);
        setIsMenuOpen(false);
        router.push("/chats");
    };

    return (
        <div className="flex h-dvh flex-col bg-white">
            <div className="z-10 flex shrink-0 items-center justify-between border-neutral-200 bg-white p-3">
                <div className="flex items-center gap-3">
                    {chatRoomType === "UNIVERSITY" ? (
                        <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-white">
                            🌍
                        </div>
                    ) : (
                        <Image
                            src={
                                firstOpponent?.avatar ||
                                "https://blocks.astratic.com/img/user-img-small.png"
                            }
                            alt={headerTitle}
                            width={50}
                            height={50}
                            className="size-9 rounded-full object-cover"
                        />
                    )}
                    <div className="flex flex-col gap-2">
                        <span className="text-lg font-semibold leading-none">
                            {headerTitle}
                        </span>
                        {chatRoomType === "UNIVERSITY" ? (
                            <span className="inline-flex items-center gap-0.5 text-sm text-neutral-400">
                                <UserIcon className="size-3.5" />
                                {participants.length}
                            </span>
                        ) : null}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsMenuOpen(true)}
                    className="rounded-md p-1 text-neutral-600 hover:bg-neutral-100"
                    aria-label="채팅방 메뉴 열기"
                >
                    <Bars3Icon className="size-6" />
                </button>
            </div>

            <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-5">
                <div className="flex-1" />
                {messages.map((message, idx) => {
                    const isMine = message.userId === userId;
                    const currentTime = formatTime(
                        message.created_at.toString(),
                    );
                    const readCount = readCountsByIndex[idx];

                    const nextMessage = messages[idx + 1];
                    const isLastInGroup =
                        !nextMessage ||
                        nextMessage.userId !== message.userId ||
                        formatTime(nextMessage.created_at.toString()) !==
                            currentTime;

                    const prevMessage = messages[idx - 1];
                    const isFirstInGroup =
                        !prevMessage || prevMessage.userId !== message.userId;

                    const isFirstMessageOfDay =
                        !prevMessage ||
                        !isSameDay(
                            new Date(prevMessage.created_at),
                            new Date(message.created_at),
                        );
                    const shouldShowAvatar =
                        !isMine && (isFirstInGroup || isFirstMessageOfDay);
                    const showReadLabel =
                        isMine && idx === readLabelTargetIndex;
                    const maxReadCount = Math.max(participants.length - 1, 0);
                    const readLabel = isGroupChat
                        ? readCount === maxReadCount
                            ? "모두 읽음"
                            : `${readCount}명 읽음`
                        : "읽음";

                    return (
                        <div key={message.id}>
                            {isFirstMessageOfDay ? (
                                <div className="my-5 flex w-full items-center">
                                    <div className="flex-1 border-t border-neutral-400" />
                                    <span className="px-4 text-sm text-mygray">
                                        {formatDate(
                                            new Date(message.created_at),
                                        )}
                                    </span>
                                    <div className="flex-1 border-t border-neutral-400" />
                                </div>
                            ) : null}
                            <div
                                className={`flex items-start gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                            >
                                {shouldShowAvatar ? (
                                    <Image
                                        src={
                                            message.user.avatar ||
                                            "https://blocks.astratic.com/img/user-img-small.png"
                                        }
                                        alt={message.user.username}
                                        width={50}
                                        height={50}
                                        className="size-8 rounded-full object-cover"
                                    />
                                ) : !isMine ? (
                                    <div className="size-8" />
                                ) : null}
                                <div
                                    className={`flex max-w-[80%] flex-col ${isMine ? "items-end" : "items-start"} ${nextMessage && nextMessage.userId !== message.userId ? "mb-5" : ""}`}
                                >
                                    {!isMine &&
                                    (isFirstInGroup || isFirstMessageOfDay) &&
                                    chatRoomType === "UNIVERSITY" ? (
                                        <span className="mb-1 ml-1 text-xs text-mygray">
                                            {message.user.username}
                                        </span>
                                    ) : null}
                                    <div
                                        className={`flex items-end gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        <div
                                            className={`${isMine ? "bg-neutral-200" : "bg-myblue text-white"} break-all rounded-2xl px-3 py-1.5`}
                                        >
                                            {message.content}
                                        </div>
                                        {isLastInGroup || showReadLabel ? (
                                            <div
                                                className={`shrink-0 ${isMine ? "items-end" : "items-start"} flex flex-col`}
                                            >
                                                {showReadLabel ? (
                                                    <span className="mb-1 text-[10px] leading-none text-mygray">
                                                        {readLabel}
                                                    </span>
                                                ) : null}
                                                {isLastInGroup ? (
                                                    <span className="text-xs text-mygray">
                                                        {currentTime}
                                                    </span>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollEndRef} />
            </div>

            <form className="bg-white p-4" onSubmit={onSubmit}>
                <div className="relative flex items-center">
                    <input
                        required
                        onChange={onChange}
                        value={message}
                        className="h-10 w-full rounded-full border-none px-5 ring-2 ring-neutral-200 transition placeholder:text-neutral-400 focus:outline-none focus:ring-neutral-400"
                        type="text"
                        name="message"
                        placeholder="메시지를 작성하세요"
                    />
                    <button
                        disabled={!message.trim()}
                        className="absolute right-0"
                    >
                        <ArrowUpCircleIcon className="size-10 text-myblue transition-colors hover:text-blue-100" />
                    </button>
                </div>
            </form>

            {isMenuOpen ? (
                <div
                    className="fixed inset-0 z-50 bg-black/40"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div
                        className="absolute right-0 top-0 h-full w-72 bg-white p-4 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50"
                            onClick={toggleMute}
                        >
                            {isMuted ? "알림 켜기" : "알림 끄기"}
                        </button>
                        <button
                            type="button"
                            className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50"
                            onClick={() => {
                                setIsMenuOpen(false);
                                setIsDeleteModalOpen(true);
                            }}
                        >
                            목록에서 삭제
                        </button>
                        <button
                            type="button"
                            className="mt-2 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-100"
                            onClick={() => {
                                setIsMenuOpen(false);
                                setIsLeaveModalOpen(true);
                            }}
                        >
                            채팅방 나가기
                        </button>

                        <div className="mt-6">
                            <h3 className="mb-2 text-sm font-semibold text-neutral-800">
                                멤버
                            </h3>
                            <ul className="flex flex-col gap-2">
                                {participants.map((participant) => (
                                    <li
                                        key={participant.id}
                                        className="rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-700"
                                    >
                                        {participant.username}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : null}

            {isDeleteModalOpen ? (
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
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 rounded-xl bg-neutral-100 py-3 font-semibold text-neutral-600 active:bg-neutral-200"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={deleteChatRoomFromList}
                                className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white active:bg-red-600"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {isLeaveModalOpen ? (
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
                                onClick={() => setIsLeaveModalOpen(false)}
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
        </div>
    );
}
