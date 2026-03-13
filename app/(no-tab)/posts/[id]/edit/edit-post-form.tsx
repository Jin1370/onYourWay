"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import LifelogEditor from "@/components/lifelog-editor";
import { useActionState, useState } from "react";
import { updatePost } from "./action";

type EditPostState = {
    fieldErrors?: {
        title?: string[];
        content?: string[];
        postType?: string[];
    };
    formErrors?: string[];
    values?: {
        postType?: string;
        title?: string;
        content?: string;
    };
} | null;

export default function EditPostForm({
    post,
}: {
    post: {
        id: number;
        postType: "LIFELOG" | "FREE";
        title: string;
        content: string;
    };
}) {
    const [state, trigger] = useActionState<EditPostState, FormData>(
        updatePost.bind(null, post.id),
        null,
    );
    const [title, setTitle] = useState(post.title);
    const [initialContent] = useState<string | undefined>(post.content);

    return (
        <div className="flex flex-col text-base min-h-screen py-12 px-5 gap-4">
            <h1 className="text-lg font-semibold">
                {post.postType === "FREE" ? "자유글 수정" : "라이프로그 수정"}
            </h1>
            <form action={trigger} noValidate className="flex flex-col gap-3">
                <input type="hidden" name="postType" value={post.postType} />
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

                <Button text="수정" />
            </form>
        </div>
    );
}
