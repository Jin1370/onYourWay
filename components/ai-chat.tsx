"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant";

interface Message {
    role: Role;
    content: string;
    sources?: Array<{ postId: number; title: string; snippet: string }>;
}

export default function AIChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollEndRef = useRef<HTMLDivElement>(null);
    const didInitialScrollRef = useRef(false);

    const canSend = useMemo(
        () => input.trim().length > 0 && !loading,
        [input, loading],
    );

    useEffect(() => {
        if (!didInitialScrollRef.current) {
            didInitialScrollRef.current = true;
            scrollEndRef.current?.scrollIntoView({ behavior: "auto" });
            return;
        }
        scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const query = input.trim();
        if (!query || loading) return;

        setInput("");
        setLoading(true);
        setMessages((prev) => [...prev, { role: "user", content: query }]);

        try {
            const response = await fetch("/api/qa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });
            const data = (await response.json()) as {
                answer?: string;
                sources?: Array<{
                    postId: number;
                    title: string;
                    snippet: string;
                }>;
                error?: string;
            };

            if (!response.ok || !data.answer) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: data.error ?? "응답을 생성하지 못했습니다.",
                    },
                ]);
                return;
            }

            const answer = data.answer ?? "";
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: answer,
                    sources: data.sources ?? [],
                },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        error instanceof Error
                            ? error.message
                            : "오류가 발생했습니다.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-14rem)] flex-col gap-4">
            <div className="flex-1 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-4">
                {messages.length === 0 ? (
                    <p className="text-md text-neutral-500">
                        아래 입력창에 질문을 입력하고 대화를 시작하세요.
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {messages.map((message, index) => (
                            <div
                                key={`${message.role}-${index}`}
                                className={`flex ${
                                    message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-md leading-relaxed ${
                                        message.role === "user"
                                            ? "bg-myblue text-white"
                                            : "bg-neutral-100 text-neutral-700"
                                    }`}
                                >
                                    <p className="whitespace-pre-line">
                                        {message.content}
                                    </p>
                                    {message.role === "assistant" &&
                                    message.sources?.length ? (
                                        <div className="mt-3 border-t border-neutral-200 pt-2 text-sm text-neutral-500">
                                            <p className="font-semibold">
                                                참고한 포스트
                                            </p>
                                            <ul className="mt-1 space-y-1">
                                                {message.sources.map(
                                                    (source, idx) => (
                                                        <li
                                                            key={`${source.postId}-${idx}`}
                                                        >
                                                            {source.title}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                        {loading ? (
                            <p className="text-md text-neutral-400 pl-3">
                                답변 생성 중...
                            </p>
                        ) : null}
                        <div ref={scrollEndRef} />
                    </div>
                )}
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3"
            >
                <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="질문을 입력하세요"
                    rows={2}
                    className="flex-1 resize-none text-md outline-none"
                />
                <button
                    type="submit"
                    disabled={!canSend}
                    className="rounded-full bg-myblue px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    보내기
                </button>
            </form>
        </div>
    );
}
