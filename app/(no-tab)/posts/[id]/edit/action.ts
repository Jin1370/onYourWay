"use server";

import db from "@/lib/db";
import { hasLifelogContent } from "@/lib/post-content";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function updatePost(
    postId: number,
    _prevState: unknown,
    formData: FormData,
) {
    const session = await getSession();
    if (!session.id) {
        return {
            formErrors: ["로그인이 필요합니다."],
            fieldErrors: {
                title: [] as string[],
                content: [] as string[],
                postType: [] as string[],
            },
        };
    }
    const rawPostType = formData.get("postType");
    const rawTitle = formData.get("title");
    const rawContent = formData.get("content");

    const formSchema = z.object({
        postType: z.enum(["LIFELOG", "FREE"]),
        title: z.string().trim().min(1, "필수 입력 항목입니다."),
        content: z.string().trim(),
    });

    const data = {
        postType: typeof rawPostType === "string" ? rawPostType : "",
        title: typeof rawTitle === "string" ? rawTitle : "",
        content: typeof rawContent === "string" ? rawContent : "",
    };

    const result = formSchema.safeParse(data);
    if (!result.success) {
        return result.error.flatten();
    }

    if (!hasLifelogContent(result.data.content)) {
        return {
            fieldErrors: {
                content: ["글 또는 사진을 1개 이상 추가해주세요."],
                title: [] as string[],
                postType: [] as string[],
            },
        };
    }

    const existingPost = await db.post.findUnique({
        where: {
            id: postId,
        },
        select: {
            userId: true,
        },
    });
    if (!existingPost || existingPost.userId !== session.id) {
        return {
            formErrors: ["수정 권한이 없습니다."],
            fieldErrors: {
                title: [] as string[],
                content: [] as string[],
                postType: [] as string[],
            },
        };
    }

    const post = await db.post.update({
        where: {
            id: postId,
        },
        data: {
            title: result.data.title,
            content: result.data.content,
        },
    });

    revalidatePath("/posts");
    redirect(`/posts/${post.id}`);
}
