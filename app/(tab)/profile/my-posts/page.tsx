import db from "@/lib/db";
import { getLifelogFirstImage, getLifelogPreview } from "@/lib/post-content";
import getSession from "@/lib/session";
import { formatToTimeAgo } from "@/lib/utils";
import {
    ChatBubbleBottomCenterIcon,
    EyeIcon,
    HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyPostsPage() {
    const session = await getSession();
    if (!session.id) {
        redirect("/login");
    }

    const posts = await db.post.findMany({
        where: {
            userId: session.id,
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

    return (
        <div className="flex flex-col p-5 pb-20">
            {posts.length === 0 ? (
                <p className="text-center text-sm text-neutral-500">
                    작성한 포스트가 없습니다.
                </p>
            ) : (
                posts.map((post) => {
                    const firstImage = getLifelogFirstImage(post.content);

                    return (
                        <Link
                            key={post.id}
                            href={`/posts/${post.id}`}
                            className="pb-5 mb-5 border-b border-neutral-200 text-neutral-400 flex flex-col gap-2 last:pb-0 last:border-b-0"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Image
                                    width={28}
                                    height={28}
                                    className="size-7 rounded-full object-cover"
                                    src={
                                        post.user.avatar ||
                                        "https://blocks.astratic.com/img/user-img-small.png"
                                    }
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
                })
            )}
        </div>
    );
}
