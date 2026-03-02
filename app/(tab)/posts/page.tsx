import db from "@/lib/db";
import { formatToTimeAgo } from "@/lib/utils";
import {
    ChatBubbleBottomCenterIcon,
    HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

async function getPosts(tab: "lifelog" | "free") {
    const posts = await db.post.findMany({
        where: {
            postType: tab === "free" ? "FREE" : "LIFELOG",
        },
        select: {
            id: true,
            postType: true,
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

export default async function Posts({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const { tab } = await searchParams;
    const currentTab: "lifelog" | "free" =
        tab === "free" ? "free" : "lifelog";
    const posts = await getPosts(currentTab);
    return (
        <div className="flex flex-col p-5 pb-20">
            <div className="grid grid-cols-2 mb-5 rounded-lg p-1 bg-neutral-100">
                <Link
                    href="/posts?tab=lifelog"
                    className={`text-center py-2 rounded-md text-sm font-semibold ${currentTab === "lifelog" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}
                >
                    라이프로그
                </Link>
                <Link
                    href="/posts?tab=free"
                    className={`text-center py-2 rounded-md text-sm font-semibold ${currentTab === "free" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}
                >
                    자유글
                </Link>
            </div>
            {posts.map((post) => (
                <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="pb-5 mb-5 border-b border-neutral-300 text-neutral-400 flex flex-col gap-2 last:pb-0 last:border-b-0"
                >
                    <h2 className="text-neutral-700 font-semibold text-lg">
                        {post.title}
                    </h2>
                    {post.postType === "LIFELOG" ? (
                        <p className="line-clamp-2 leading-relaxed">
                            {post.content}
                        </p>
                    ) : null}
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
                                {post._count.likes}
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
                href={`/posts/create?tab=${currentTab}`}
                className="fixed bottom-20 right-10 size-15 text-myblue hover:text-myblue/80 transition-colors"
            >
                <PlusCircleIcon />
            </Link>
        </div>
    );
}
