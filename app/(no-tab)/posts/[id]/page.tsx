import Button from "@/components/button";
import Input from "@/components/input";
import LikeButton from "@/components/like-button";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToTimeAgo } from "@/lib/utils";
import { EyeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createComment, deleteComment } from "./action";
import Link from "next/link";
import DeleteBtn from "@/components/delete-button";

async function getPost(postId: number) {
    const post = await db.post.update({
        where: {
            id: postId,
        },
        data: {
            views: {
                increment: 1,
            },
        },
        include: {
            user: {
                select: {
                    username: true,
                    avatar: true,
                },
            },
            _count: {
                select: {
                    comments: true,
                    likes: true,
                },
            },
        },
    });
    return post;
}

async function getComments(postId: number) {
    const comments = await db.postComment.findMany({
        where: {
            postId,
        },
        select: {
            id: true,
            content: true,
            created_at: true,
            userId: true,
            user: {
                select: {
                    username: true,
                    avatar: true,
                },
            },
        },
    });
    return comments;
}

async function getIsLiked(postId: number, userId: number) {
    const isLiked = await db.postLike.findUnique({
        where: {
            id: {
                postId,
                userId,
            },
        },
    });
    return Boolean(isLiked);
}

export default async function Post({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: strId } = await params;
    const postId = Number(strId);
    if (isNaN(postId)) return notFound();

    const post = await getPost(postId);
    if (!post) return notFound();
    const comments = await getComments(postId);

    const session = await getSession();
    const isLiked = await getIsLiked(postId, session.id!);

    async function deletePost() {
        "use server";
        await db.post.delete({
            where: {
                id: post.id,
            },
        });
        redirect("/posts");
    }

    return (
        <div className="p-5 text-neutral-700 pb-30">
            <div className="flex items-center gap-2 mb-2">
                <Image
                    width={28}
                    height={28}
                    className="size-7 rounded-full"
                    src={post.user.avatar!}
                    alt={post.user.username}
                />
                <div>
                    <span className="text-sm font-semibold">
                        {post.user.username}
                    </span>
                    <div className="text-xs">
                        <span>
                            {formatToTimeAgo(post.created_at.toString())}
                        </span>
                    </div>
                </div>
            </div>
            <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
            {post.postType === "FREE" ? (
                <span className="inline-flex mb-3 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                    자유글
                </span>
            ) : null}
            {post.content ? <p className="mb-10">{post.content}</p> : null}
            <div className="flex flex-col gap-3 items-start">
                <div className="flex items-center gap-2 text-mygray text-sm">
                    <EyeIcon className="size-5" />
                    <span>조회 {post.views}</span>
                </div>
                <div className="flex gap-2">
                    <LikeButton
                        isLiked={isLiked}
                        likeCount={post._count.likes}
                        postId={postId}
                    />
                    {post.userId === session.id ? (
                        <div className="flex gap-2">
                            <Link
                                href={`/posts/${post.id}/edit`}
                                className="text-sm border rounded-full p-2 w-14 bg-myblue text-white border-myblue hover:bg-myblue/80 transition-colors text-center"
                            >
                                수정
                            </Link>
                            <DeleteBtn onDelete={deletePost} />
                        </div>
                    ) : null}
                </div>
            </div>
            <div className="flex flex-col py-7">
                {post._count.comments !== 0 ? (
                    <span className="mb-1 text-mygray">
                        댓글 {post._count.comments}
                    </span>
                ) : null}
                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        className="flex items-center justify-between py-5 border-t border-neutral-300 last:mb-0 text-sm"
                    >
                        <div className="flex items-center gap-5">
                            <Image
                                width={28}
                                height={28}
                                className="size-7 rounded-full"
                                src={comment.user.avatar!}
                                alt={comment.user.username}
                            />
                            <div className="flex flex-col">
                                <div>
                                    <span>{comment.user.username}</span>
                                    <span> • </span>
                                    <span className="text-xs">
                                        {formatToTimeAgo(
                                            comment.created_at.toString(),
                                        )}
                                    </span>
                                </div>
                                <span>{comment.content}</span>
                            </div>
                        </div>
                        {session.id === comment.userId ? (
                            <form
                                action={deleteComment.bind(
                                    null,
                                    postId,
                                    comment.id,
                                )}
                            >
                                <button>삭제</button>
                            </form>
                        ) : null}
                    </div>
                ))}
            </div>
            <form
                action={createComment.bind(null, postId)}
                className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-screen-sm flex flex-col gap-2 border-t border-neutral-300 bg-white p-5"
            >
                <span>댓글 작성</span>
                <div className="flex w-full gap-2 items-start">
                    <div className="flex-8">
                        <Input
                            name="comment"
                            required
                            placeholder="댓글을 작성하세요"
                            type="text"
                        />
                    </div>
                    <div className="flex-2">
                        <Button text="완료" />
                    </div>
                </div>
            </form>
        </div>
    );
}
