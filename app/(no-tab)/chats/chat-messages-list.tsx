"use client";

import { useEffect, useRef, useState } from "react";
import { InitialMessages } from "./[id]/page";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import { formatDate, formatTime, formatToTimeAgo } from "@/lib/utils";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import { saveMessage } from "./action";

const SUPABASE_URL = "https://xvhlzzgnlvjssyftujvh.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_J-MWCPiI_DmRYAchyzYo8Q_5xxPYQP7";

interface ChatMessageListProps {
    chatRoomId: string;
    participants: { id: number; username: string; avatar: string | null }[]; //객체들의 배열
    userId: number;
    username: string;
    avatar: string;
    initialMessages: InitialMessages;
    chatRoomType: string;
    universityName?: string;
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
}: ChatMessageListProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [message, setMessage] = useState("");

    //useRef(): 컴포넌트 내 여러 함수 사이에서 데이터를 저장 및 공유. 변경이 일어나도 리렌더링 없이 데이터 유지
    // -> useEffect에서 초기화하거나 참여한 채널에 접근 가능하게 함
    const channel = useRef<RealtimeChannel>(null);
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };
    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault(); //페이지 새로고침 방지
        if (!message.trim()) return; //공백 메시지 방지

        const newMessage = {
            id: Date.now(), //상관없음
            content: message,
            created_at: new Date(),
            userId,
            user: {
                username,
                avatar,
            },
        };
        //UI 즉시 업데이트
        setMessages((prevMsgs) => [...prevMsgs, newMessage]);

        //supabase 채널을 통해 이 방에 접속 중인 다른 사람들에게 메시지 보냈다고 방송(Broadcast)
        //내가 보낸 메시지를 실시간으로 낚아채서 상대방 브라우저에게 메시지를 그리라고 전달
        //이게 없으면 상대방은 새로고침하지 않는 이상 메시지를 볼 수 없음
        channel.current?.send({
            type: "broadcast",
            event: "message", //이벤트 이름 지정
            payload: newMessage,
        });

        await saveMessage(message, chatRoomId); //db에 저장
        setMessage(""); //입력창 비우기
    };

    //supabase https://supabase.com/docs/guides/realtime/broadcast
    //chatRoomId가 바뀔 때마다 새로 실행
    useEffect(() => {
        const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
        channel.current = client.channel(`room-${chatRoomId}`);
        channel.current
            .on("broadcast", { event: "message" }, (payload) => {
                setMessages((prevMsgs) => [...prevMsgs, payload.payload]);
            })
            .subscribe();
        return () => {
            channel.current?.unsubscribe();
        };
    }, [chatRoomId]);

    //자동 스크롤 - messages 배열이 업데이트되면 메시지 목록 맨 끝 div가 보이도록 스크롤
    const scrollEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const otherParticipants = participants.filter((user) => user.id !== userId);
    const firstOpponent = otherParticipants[0];

    const headerTitle =
        chatRoomType === "UNIVERSITY"
            ? `${universityName}`
            : firstOpponent?.username || "대화 상대 없음";

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    return (
        <div className="flex flex-col h-dvh bg-white">
            <div className="bg-white border-neutral-200 z-10 p-3 flex items-center gap-3 shrink-0">
                {chatRoomType === "UNIVERSITY" ? (
                    <div className="size-9 rounded-full  flex items-center justify-center bg-blue-100 text-white font-bold text-lg">
                        🏛️
                    </div>
                ) : (
                    <Image
                        src={firstOpponent?.avatar || "/default-avatar.png"}
                        alt={headerTitle}
                        width={50}
                        height={50}
                        className="size-9 rounded-full object-cover"
                    />
                )}
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-lg leading-none">
                        {headerTitle}
                    </span>
                    {chatRoomType === "UNIVERSITY" && (
                        <span className="text-xs text-mygray">
                            접속 중인 유저 {participants.length}명
                        </span>
                    )}
                </div>
            </div>
            <div className="flex flex-col flex-1 overflow-y-auto gap-1 p-5">
                {/* 메시지가 몇 개 없을 때, 아래에 붙게 하기 위함 */}
                <div className="flex-1" />{" "}
                {messages.map((message, idx) => {
                    const isMine = message.userId === userId;
                    const currentTime = formatTime(
                        message.created_at.toString(),
                    );

                    // 같은 분 내의 연속된 메시지 처리 로직
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

                    return (
                        <div key={message.id}>
                            {isFirstMessageOfDay && (
                                <div className="flex items-center w-full my-2">
                                    <div className="flex-1 border-t border-neutral-400" />
                                    <span className="px-4 text-sm text-mygray">
                                        {formatDate(
                                            new Date(message.created_at),
                                        )}
                                    </span>
                                    <div className="flex-1 border-t border-neutral-400" />
                                </div>
                            )}
                            <div
                                className={`flex gap-2 items-start ${isMine ? "justify-end" : "justify-start"}`}
                            >
                                {!isMine && isFirstInGroup ? (
                                    <Image
                                        src={
                                            message.user.avatar ||
                                            "/default-avatar.png"
                                        }
                                        alt={message.user.username}
                                        width={50}
                                        height={50}
                                        className="size-8 rounded-full object-cover"
                                    />
                                ) : (
                                    !isMine && <div className="size-8" />
                                )}
                                <div
                                    className={`flex flex-col max-w-[80%] ${isMine ? "items-end" : "items-start"} ${nextMessage && nextMessage.userId !== message.userId ? "mb-5" : ""}`}
                                >
                                    {!isMine &&
                                        isFirstInGroup &&
                                        chatRoomType === "UNIVERSITY" && (
                                            <span className="text-xs text-mygray mb-1 ml-1">
                                                {message.user.username}
                                            </span>
                                        )}
                                    <div
                                        className={`flex items-end gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        <div
                                            className={`${isMine ? "bg-neutral-200" : "bg-myblue text-white"} py-1.5 px-3 rounded-2xl break-all`}
                                        >
                                            {message.content}
                                        </div>
                                        {isLastInGroup && (
                                            <span className="shrink-0 text-xs text-mygray">
                                                {currentTime}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollEndRef} />
            </div>
            <form className="p-4 bg-white" onSubmit={onSubmit}>
                <div className="relative flex items-center">
                    <input
                        required
                        onChange={onChange}
                        value={message}
                        className="rounded-full w-full h-10 focus:outline-none px-5 ring-2 transition ring-neutral-200 focus:ring-neutral-400 border-none placeholder:text-neutral-400"
                        type="text"
                        name="message"
                        placeholder="메시지를 작성하세요."
                    />
                    <button
                        disabled={!message.trim()}
                        className="absolute right-0"
                    >
                        <ArrowUpCircleIcon className="size-10 text-myblue transition-colors hover:text-blue-100" />
                    </button>
                </div>
            </form>
        </div>
    );
}
