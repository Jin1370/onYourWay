"use client";

import { useEffect, useRef, useState } from "react";
import { InitialMessages } from "./[id]/page";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import { formatTime, formatToTimeAgo } from "@/lib/utils";
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
}
export default function ChatMessagesList({
    chatRoomId,
    participants,
    userId,
    username,
    avatar,
    initialMessages,
}: ChatMessageListProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [message, setMessage] = useState("");

    //useRef(): 컴포넌트 내 여러 함수 사이에서 데이터를 저장 및 공유. 변경이 일어나도 리렌더링 없이 데이터 유지
    // -> useEffect에서 초기화하거나 참여한 채널에 접근 가능하게 함
    const channel = useRef<RealtimeChannel>(null);
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {
            target: { value },
        } = event;
        setMessage(value);
        // = setMessage(event.target.value);
    };
    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault(); //페이지 새로고침 방지

        //화면 즉시 업데이트
        setMessages((prevMsgs) => [
            ...prevMsgs,
            {
                id: Date.now(), //상관없음
                content: message,
                created_at: new Date(),
                userId,
                user: {
                    username: "x", //상관없음
                    avatar: "x", //상관없음
                },
            },
        ]);

        //supabase 채널을 통해 이 방에 접속 중인 다른 사람들에게 메시지 보냈다고 방송(Broadcast)
        //내가 보낸 메시지를 실시간으로 낚아채서 상대방 브라우저에게 메시지를 그리라고 전달
        //이게 없으면 상대방은 새로고침하지 않는 이상 메시지를 볼 수 없음
        channel.current?.send({
            type: "broadcast",
            event: "message", //이벤트 이름 지정
            payload: {
                id: Date.now(), //상관없음
                content: message,
                created_at: new Date(),
                userId,
                user: {
                    username,
                    avatar,
                },
            },
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
    const scrollToBottom = () => {
        scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    //나를 제외한 첫번째 대화 상대 찾기
    const firstOpponent = participants.find((user) => user.id !== userId);
    const participantsNum = participants.length - 1;

    return (
        <div className="flex flex-col h-dvh">
            <div className="bg-white z-10 p-3 flex items-center gap-3">
                {firstOpponent ? (
                    <>
                        <Image
                            src={firstOpponent.avatar || "/default-avatar.png"}
                            alt={firstOpponent.username}
                            width={50}
                            height={50}
                            className="size-9 rounded-full"
                        />
                        <span className="font-semibold text-lg">
                            {firstOpponent.username}
                            {participantsNum > 1
                                ? ` 외 ${participantsNum}명`
                                : null}
                        </span>
                    </>
                ) : (
                    <span className="font-semibold text-lg">
                        대화 상대 없음
                    </span>
                )}
            </div>
            <div className="flex flex-col flex-1 overflow-y-auto gap-1 p-5">
                {/* 메시지가 몇 개 없을 때, 아래에 붙게 하기 위함 */}
                <div className="flex-1" />{" "}
                {messages.map((message, idx) => {
                    const nextMessage = messages[idx + 1];
                    const currentTime = formatTime(
                        message.created_at.toString(),
                    );
                    const nextTime = nextMessage
                        ? formatTime(nextMessage.created_at.toString())
                        : null;
                    const showTime =
                        !nextMessage ||
                        currentTime !== nextTime ||
                        message.userId !== nextMessage.userId;
                    const showAvatar =
                        message.userId !== userId &&
                        (idx === 0 ||
                            messages[idx - 1].userId !== message.userId);
                    return (
                        <div
                            key={message.id}
                            className={`flex gap-2 items-start ${message.userId === userId ? "justify-end" : ""}`}
                            // items-start:아바타와 메시지 박스의 윗변을 맞춤
                            // justify-end:내 메시지면 오른쪽으로 밀어버림
                        >
                            {showAvatar ? (
                                <Image
                                    src={message.user.avatar!}
                                    alt={message.user.username}
                                    width={50}
                                    height={50}
                                    className="size-8 rounded-full"
                                />
                            ) : (
                                <div className="size-8" />
                            )}
                            <div
                                className={`flex gap-1 items-end max-w-[80%] ${message.userId === userId ? "flex-row-reverse" : ""} ${idx !== messages.length - 1 && messages[idx + 1].userId !== message.userId ? "mb-8" : "mb-1"}`}
                            >
                                <span
                                    className={`${message.userId === userId ? "bg-neutral-200" : "bg-myblue text-white"} py-1.5 px-3 rounded-md break-all`}
                                >
                                    {message.content}
                                </span>
                                {showTime && (
                                    <span className="shrink-0 text-xs text-mygray ">
                                        {currentTime}
                                    </span>
                                )}
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
                    <button disabled={!message} className="absolute right-0">
                        <ArrowUpCircleIcon className="size-10 text-myblue transition-colors hover:text-blue-100" />
                    </button>
                </div>
            </form>
        </div>
    );
}
