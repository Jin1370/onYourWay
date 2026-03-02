import db from "@/lib/db";
import { notFound } from "next/navigation";
import EditPostForm from "./edit-post-form";

export default async function EditPost({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: strId } = await params;
    const postId = Number(strId);
    if (isNaN(postId)) return notFound();

    const post = await db.post.findUnique({
        where: {
            id: postId,
        },
        select: {
            id: true,
            postType: true,
            title: true,
            content: true,
        },
    });
    if (!post) return notFound();
    return <EditPostForm post={post} />;
}
