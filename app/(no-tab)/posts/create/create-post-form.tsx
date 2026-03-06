"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import LifelogEditor from "@/components/lifelog-editor";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { createPost } from "./action";

interface CreatePostFormProps {
    tab: "lifelog" | "free";
    canWriteLifelog: boolean;
}

export default function CreatePostForm({
    tab,
    canWriteLifelog,
}: CreatePostFormProps) {
    const isFree = tab === "free";
    const [state, trigger] = useActionState(createPost, null);
    const [title, setTitle] = useState("");
    const [initialContent, setInitialContent] = useState<string | undefined>(
        undefined,
    );

    useEffect(() => {
        const values = (state as any)?.values;
        if (!values) return;
        setTitle(values.title ?? "");
        setInitialContent(values.content ?? "");
    }, [state]);

    if (!isFree && !canWriteLifelog) {
        return (
            <div className="flex flex-col text-base min-h-screen py-12 px-8 gap-4">
                <h1 className="text-lg font-semibold">라이프로그 작성</h1>
                <div className="rounded-lg border border-neutral-200 p-4 flex flex-col gap-3">
                    <p className="text-sm text-neutral-700">
                        라이프로그 작성은 해외 소속 대학 등록이 필요해요.
                    </p>
                    <Link
                        href="/profile/add-affiliated-univ"
                        className="primary-btn text-center"
                    >
                        해외 소속 대학 등록하러 가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col text-base min-h-screen py-12 px-5 gap-4">
            <h1 className="text-lg font-semibold">
                {isFree ? "자유글 작성" : "라이프로그 작성"}
            </h1>
            <form action={trigger} noValidate className="flex flex-col gap-3">
                <input
                    type="hidden"
                    name="postType"
                    value={isFree ? "FREE" : "LIFELOG"}
                />
                <Input
                    type="text"
                    placeholder="제목"
                    required
                    name="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    errors={state?.fieldErrors.title}
                />
                <LifelogEditor
                    name="content"
                    initialContent={initialContent}
                    errors={state?.fieldErrors.content}
                />

                {state?.formErrors?.length ? (
                    <div className="flex flex-col gap-2">
                        {state.formErrors.map((error: string, idx: number) => (
                            <span key={idx} className="text-red-500 text-sm">
                                {error}
                            </span>
                        ))}
                    </div>
                ) : null}
                <Button text="등록" />
            </form>
        </div>
    );
}
