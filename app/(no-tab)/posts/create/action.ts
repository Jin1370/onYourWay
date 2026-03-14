"use server";

import db from "@/lib/db";
import { hasLifelogContent } from "@/lib/post-content";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function createPost(_prevState: unknown, formData: FormData) {
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
        return {
            ...result.error.flatten(),
            values: data,
        };
    }

    if (!hasLifelogContent(result.data.content)) {
        return {
            fieldErrors: {
                content: ["글 또는 사진을 1개 이상 추가해주세요."],
                title: [] as string[],
                postType: [] as string[],
            },
            formErrors: [] as string[],
            values: data,
        };
    }

    const session = await getSession();
    if (!session.id) {
        return {
            fieldErrors: {
                content: [] as string[],
                title: [] as string[],
                postType: [] as string[],
            },
            formErrors: ["로그인이 필요합니다."],
            values: data,
        };
    }
    const user = await db.user.findUnique({
        where: {
            id: session.id,
        },
        select: {
            foreignAffiliatedUnivId: true,
        },
    });

    if (result.data.postType === "LIFELOG" && !user?.foreignAffiliatedUnivId) {
        return {
            fieldErrors: {
                content: [] as string[],
                title: [] as string[],
                postType: [] as string[],
            },
            formErrors: ["라이프로그 작성은 해외 소속 대학 등록이 필요합니다."],
            values: data,
        };
    }

    const post = await db.post.create({
        data: {
            userId: session.id,
            postType: result.data.postType,
            title: result.data.title,
            content: result.data.content,
        },
    });

    revalidatePath("/posts");
    redirect(`/posts/${post.id}`);
}


