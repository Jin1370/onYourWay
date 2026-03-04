"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import LifelogEditor from "@/components/lifelog-editor";
import { useActionState } from "react";
import { updatePost } from "./action";

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
    const [state, trigger] = useActionState(
        updatePost.bind(null, post.id),
        null,
    );

    return (
        <div className="flex flex-col text-base min-h-screen py-20 px-5 gap-4">
            <form action={trigger} noValidate className="flex flex-col gap-3">
                <input type="hidden" name="postType" value={post.postType} />
                <Input
                    type="text"
                    placeholder="제목"
                    required
                    name="title"
                    defaultValue={post.title}
                    errors={state?.fieldErrors.title}
                />
                <LifelogEditor
                    name="content"
                    initialContent={post.content}
                    errors={state?.fieldErrors.content}
                />
                <Button text="수정" />
            </form>
        </div>
    );
}

