"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import InputContent from "@/components/input-content";
import Link from "next/link";
import { useActionState } from "react";
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

    if (!isFree && !canWriteLifelog) {
        return (
            <div className="flex flex-col text-base min-h-screen py-20 px-8 gap-4">
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
        <div className="flex flex-col text-base min-h-screen py-20 px-8 gap-4">
            <h1 className="text-lg font-semibold">
                {isFree ? "자유글 작성" : "라이프로그 작성"}
            </h1>
            <form action={trigger} noValidate className="flex flex-col gap-3">
                <input
                    type="hidden"
                    name="postType"
                    value={isFree ? "FREE" : "LIFELOG"}
                />
                {isFree ? (
                    <Input
                        type="text"
                        placeholder="질문이나 스몰토크를 자유롭게 남겨보세요"
                        required
                        name="title"
                        errors={state?.fieldErrors.title}
                    />
                ) : (
                    <>
                        <Input
                            type="text"
                            placeholder="제목"
                            required
                            name="title"
                            errors={state?.fieldErrors.title}
                        />
                        <InputContent
                            placeholder="본문"
                            required
                            name="content"
                            errors={state?.fieldErrors.content}
                            rowsNum={10}
                        />
                    </>
                )}
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
