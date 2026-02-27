"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { useActionState } from "react";
import { createPost } from "./action";
import InputContent from "@/components/input-content";

export default function CreatePost() {
    const [state, trigger] = useActionState(createPost, null);
    return (
        <div className="flex flex-col text-base min-h-screen py-20 px-8 gap-4">
            <form action={trigger} noValidate className="flex flex-col gap-3">
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
                <Button text="등록" />
            </form>
        </div>
    );
}
