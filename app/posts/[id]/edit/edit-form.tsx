"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { useActionState } from "react";
import InputContent from "@/components/input-content";
import { updatePost } from "./action";

export default function EditForm({
    post,
}: {
    post: { id: number; title: string; content: string };
}) {
    const [state, trigger] = useActionState(
        updatePost.bind(null, post.id),
        null,
    );
    return (
        <div className="flex flex-col text-base min-h-screen py-20 px-8 gap-4">
            <form action={trigger} noValidate className="flex flex-col gap-3">
                <Input
                    type="text"
                    placeholder="제목"
                    required
                    name="title"
                    defaultValue={post.title}
                    errors={state?.fieldErrors.title}
                />
                <InputContent
                    placeholder="본문"
                    required
                    name="content"
                    defaultValue={post.content}
                    errors={state?.fieldErrors.content}
                />
                <Button text="등록" />
            </form>
        </div>
    );
}
