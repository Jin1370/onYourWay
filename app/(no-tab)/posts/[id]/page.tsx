import Button from "@/components/button";
import DeleteBtn from "@/components/delete-button";
import Input from "@/components/input";
import LifelogViewer from "@/components/lifelog-viewer";
import LikeButton from "@/components/like-button";
import ViewTracker from "@/components/view-tracker";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToTimeAgo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createComment } from "./action";
import CommentList from "./comment-list";

async function getPost(postId: number) {
    const post = await db.post.findUnique({
        where: {
            id: postId,
        },
        include: {
            user: {
                select: {
                    username: true,
                    avatar: true,
                    foreignAffiliatedUniv: {
                        select: {
                            name: true,
                        },
                    },
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

async function getComments(postId: number, sessionId: number) {
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
            _count: {
                select: {
                    likes: true,
                },
            },
            likes: {
                where: {
                    userId: sessionId,
                },
                select: {
                    userId: true,
                },
            },
        },
    });
    return comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        userId: comment.userId,
        user: comment.user,
        likeCount: comment._count.likes,
        isLiked: comment.likes.length > 0,
    }));
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

    const session = await getSession();
    if (!session.id) {
        redirect("/login");
    }
    const post = await getPost(postId);
    if (!post) return notFound();
    const comments = (await getComments(postId, session.id)).map((comment) => ({
        ...comment,
        created_at: comment.created_at.toString(),
    }));
    const isLiked = await getIsLiked(postId, session.id);

    async function deletePost() {
        "use server";
        const session = await getSession();
        if (!session.id || session.id !== post.userId) {
            return;
        }
        await db.post.delete({
            where: {
                id: post.id,
            },
        });
        redirect("/posts");
    }

    return (
        <div className="p-5 text-neutral-700 pb-30">
            <ViewTracker type="post" id={postId} />
            <div className="flex items-center gap-2 mb-2">
                <Image
                    width={28}
                    height={28}
                    className="size-7 rounded-full"
                    src={
                        post.user.avatar ||
                        "https://blocks.astratic.com/img/user-img-small.png"
                    }
                    alt={post.user.username}
                />
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                            {post.user.username}
                        </span>
                        {post.postType === "LIFELOG" &&
                        post.user.foreignAffiliatedUniv?.name ? (
                            <span className="inline-flex items-center text-[11px] leading-4 px-1.5 py-0 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                {post.user.foreignAffiliatedUniv.name}
                            </span>
                        ) : null}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs">
                        <span>
                            {formatToTimeAgo(post.created_at.toString())}
                        </span>
                        <span>·</span>
                        <span>조회 {post.views}</span>
                    </div>
                </div>
            </div>

            <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
            {post.content ? (
                <div className="mb-10">
                    <LifelogViewer content={post.content} />
                </div>
            ) : null}

            <div className="flex flex-col gap-3 items-start">
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
                <CommentList
                    comments={comments}
                    postId={postId}
                    sessionId={session.id}
                />
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
                            placeholder="댓글을 작성해주세요"
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
