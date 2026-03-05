import db from "@/lib/db";
import { getLifelogFirstImage, getLifelogPreview } from "@/lib/post-content";
import { formatToTimeAgo } from "@/lib/utils";
import {
    ChatBubbleBottomCenterIcon,
    EyeIcon,
    HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

async function getPosts(tab: "lifelog" | "free") {
    const posts = await db.post.findMany({
        where: {
            postType: tab === "free" ? "FREE" : "LIFELOG",
        },
        orderBy: {
            created_at: "desc",
        },
        select: {
            id: true,
            postType: true,
            title: true,
            content: true,
            views: true,
            created_at: true,
            user: {
                select: {
                    username: true,
                    avatar: true,
                    affiliatedUniv: {
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
    return posts;
}

export default async function Posts({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const { tab } = await searchParams;
    const currentTab: "lifelog" | "free" = tab === "free" ? "free" : "lifelog";
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

            {posts.map((post) => {
                const firstImage = getLifelogFirstImage(post.content);

                return (
                    <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        className="pb-5 mb-5 border-b border-neutral-300 text-neutral-400 flex flex-col gap-2 last:pb-0 last:border-b-0"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Image
                                width={28}
                                height={28}
                                className="size-7 rounded-full object-cover"
                                src={post.user.avatar || "/default-avatar.png"}
                                alt={post.user.username}
                            />
                            <div className="flex flex-col leading-tight">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-neutral-700">
                                        {post.user.username}
                                    </span>
                                    {post.postType === "LIFELOG" &&
                                    post.user.affiliatedUniv?.name ? (
                                        <span className="inline-flex items-center text-[11px] leading-4 px-1.5 py-0 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                            {post.user.affiliatedUniv.name}
                                        </span>
                                    ) : null}
                                </div>
                                <span className="text-xs mt-0.5">
                                    {formatToTimeAgo(
                                        post.created_at.toString(),
                                    )}
                                </span>
                            </div>
                        </div>
                        {firstImage ? (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-neutral-200 mb-1">
                                <Image
                                    src={firstImage}
                                    alt={post.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 640px"
                                    className="object-cover"
                                />
                            </div>
                        ) : null}

                        <h2 className="text-neutral-700 font-semibold text-lg">
                            {post.title}
                        </h2>
                        <p className="line-clamp-2 leading-relaxed">
                            {getLifelogPreview(post.content)}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex gap-1 items-center">
                                <EyeIcon className="size-4" />
                                <span>{post.views}</span>
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
                );
            })}

            <Link
                href={`/posts/create?tab=${currentTab}`}
                className="fixed bottom-20 right-10 size-15 text-myblue hover:text-myblue/80 transition-colors bg-white bg-clip-text"
            >
                <PlusCircleIcon />
            </Link>
        </div>
    );
}
