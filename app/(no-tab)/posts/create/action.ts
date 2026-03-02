"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function createPost(prevState: any, formData: FormData) {
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
    } else {
        if (
            result.data.postType === "LIFELOG" &&
            result.data.content.length === 0
        ) {
            return {
                fieldErrors: {
                    content: ["필수 입력 항목입니다."],
                    title: [] as string[],
                    postType: [] as string[],
                },
                formErrors: [] as string[],
            };
        }

        const session = await getSession();
        const user = await db.user.findUnique({
            where: {
                id: session.id!,
            },
            select: {
                affiliatedUnivId: true,
            },
        });

        if (
            result.data.postType === "LIFELOG" &&
            !user?.affiliatedUnivId
        ) {
            return {
                fieldErrors: {
                    content: [] as string[],
                    title: [] as string[],
                    postType: [] as string[],
                },
                formErrors: ["라이프로그 작성은 해외 소속 대학 등록이 필요합니다."],
            };
        }

        const post = await db.post.create({
            data: {
                userId: session.id!,
                postType: result.data.postType,
                title: result.data.title,
                content:
                    result.data.postType === "FREE"
                        ? ""
                        : result.data.content,
            },
        });
        revalidatePath("/posts");
        redirect(`/posts/${post.id}`);
    }
}
