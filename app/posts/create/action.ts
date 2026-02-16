"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function createPost(prevState: any, formData: FormData) {
    const formSchema = z.object({
        title: z.string().trim().min(1, "필수 입력 항목입니다."),
        content: z.string().trim().min(1, "필수 입력 항목입니다."),
    });
    const data = {
        title: formData.get("title"),
        content: formData.get("content"),
    };
    const result = formSchema.safeParse(data);
    if (!result.success) {
        return result.error.flatten();
    } else {
        const session = await getSession();
        const post = await db.posts.create({
            data: {
                userId: session.id!,
                title: result.data.title,
                content: result.data.content,
            },
        });
        revalidatePath("/posts");
        redirect(`/posts/${post.id}`);
    }
}
