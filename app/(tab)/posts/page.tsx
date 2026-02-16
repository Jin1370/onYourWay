import db from "@/lib/db";
import { formatToTimeAgo } from "@/lib/utils";
import {
    ChatBubbleBottomCenterIcon,
    HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

async function getPosts() {
    const posts = await db.posts.findMany({
        select: {
            id: true,
            title: true,
            content: true,
            views: true,
            created_at: true,
            _count: {
                select: {
                    comments: true,
                    likes: true,
                },
            },
        },
    });
    return posts;
}

export default async function Posts() {
    const posts = await getPosts();
    return (
        <div className="flex flex-col p-5 pb-20">
            {posts.map((post) => (
                <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="pb-5 mb-5 border-b border-neutral-300 text-neutral-400 flex flex-col gap-2 last:pb-0 last:border-b-0"
                >
                    <h2 className="text-neutral-700 font-semibold text-lg">
                        {post.title}
                    </h2>
                    <p className="line-clamp-2 leading-relaxed">
                        {post.content}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-4 items-center">
                            <span>
                                {formatToTimeAgo(post.created_at.toString())}
                            </span>
                            <span>•</span>
                            <span>조회 {post.views}</span>
                        </div>
                        <div className="flex gap-4 items-center *:flex *:gap-1 *:items-center text-myblue">
                            <span>
                                <HandThumbUpIcon className="size-4" />
                                {post._count.comments}
                            </span>
                            <span>
                                <ChatBubbleBottomCenterIcon className="size-4" />
                                {post._count.comments}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
            <Link
                href="/posts/create"
                className="fixed bottom-20 right-10 size-15 text-myblue hover:text-blue-200"
            >
                <PlusCircleIcon />
            </Link>
        </div>
    );
}
