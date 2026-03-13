import ListSearchForm from "@/components/list-search-form";
import db from "@/lib/db";
import { getLifelogFirstImage, getLifelogPreview } from "@/lib/post-content";
import getSession from "@/lib/session";
import { formatToTimeAgo } from "@/lib/utils";
import {
    ChatBubbleBottomCenterIcon,
    EyeIcon,
    HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

async function getPosts(
    tab: "lifelog" | "free",
    interestedUnivIds?: number[],
    keyword?: string,
) {
    if (interestedUnivIds && interestedUnivIds.length === 0) {
        return [];
    }

    const where: {
        postType: "FREE" | "LIFELOG";
        user?: {
            affiliatedUnivId?: {
                in: number[];
            };
        };
        OR?: Array<{
            title?: { contains: string };
            content?: { contains: string };
            user?: { username: { contains: string } };
        }>;
    } = {
        postType: tab === "free" ? "FREE" : "LIFELOG",
    };

    if (interestedUnivIds) {
        where.user = {
            affiliatedUnivId: {
                in: interestedUnivIds,
            },
        };
    }

    if (keyword) {
        where.OR = [
            { title: { contains: keyword } },
            { content: { contains: keyword } },
            { user: { username: { contains: keyword } } },
        ];
    }

    return db.post.findMany({
        where,
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
}

export default async function Posts({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string; interest?: string; q?: string }>;
}) {
    const { tab, interest, q } = await searchParams;
    const currentTab: "lifelog" | "free" = tab === "free" ? "free" : "lifelog";
    const isLifelogTab = currentTab === "lifelog";
    const interestOnly = isLifelogTab && interest === "1";
    const keyword = q?.trim() ?? "";

    let interestedUnivIds: number[] | undefined;
    if (interestOnly) {
        const session = await getSession();
        if (!session.id) {
            interestedUnivIds = [];
        } else {
            const user = await db.user.findUnique({
                where: { id: session.id },
                select: {
                    interestedUnivs: {
                        select: { id: true },
                    },
                },
            });
            interestedUnivIds = (user?.interestedUnivs ?? []).map((u) => u.id);
        }
    }

    const posts = await getPosts(currentTab, interestedUnivIds, keyword);

    const getTabHref = (nextTab: "lifelog" | "free") => {
        const params = new URLSearchParams();
        params.set("tab", nextTab);
        if (nextTab === "lifelog" && interestOnly) {
            params.set("interest", "1");
        }
        if (keyword) {
            params.set("q", keyword);
        }
        return `/posts?${params.toString()}`;
    };

    const interestFilterParams = new URLSearchParams();
    interestFilterParams.set("tab", "lifelog");
    if (!interestOnly) {
        interestFilterParams.set("interest", "1");
    }
    if (keyword) {
        interestFilterParams.set("q", keyword);
    }
    const interestFilterHref = `/posts?${interestFilterParams.toString()}`;

    return (
        <div className="flex flex-col p-5 pt-3 pb-20">
            <div className="space-y-2">
                <div className="grid grid-cols-2 rounded-lg bg-neutral-100 p-1">
                    <Link
                        href={getTabHref("lifelog")}
                        className={`rounded-md py-2 text-center text-sm font-semibold ${currentTab === "lifelog" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}
                    >
                        라이프로그
                    </Link>
                    <Link
                        href={getTabHref("free")}
                        className={`rounded-md py-2 text-center text-sm font-semibold ${currentTab === "free" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}
                    >
                        자유글
                    </Link>
                </div>

                <ListSearchForm
                    action="/posts"
                    placeholder="포스트 검색"
                    defaultValue={keyword}
                    hiddenParams={[
                        { name: "tab", value: currentTab },
                        ...(interestOnly
                            ? [{ name: "interest", value: "1" }]
                            : []),
                    ]}
                />

                {isLifelogTab ? (
                    <div className="flex rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
                        <Link
                            href={interestFilterHref}
                            className="inline-flex items-center gap-2 text-sm text-neutral-700"
                        >
                            <input
                                type="checkbox"
                                checked={interestOnly}
                                readOnly
                                className="size-4 accent-myblue"
                            />
                            <span>관심학교만 보기</span>
                        </Link>
                    </div>
                ) : null}
            </div>

            <div className="mt-5">
                {posts.length === 0 ? (
                    <p className="pt-3 text-center text-sm text-neutral-500">
                        포스트가 존재하지 않습니다.
                    </p>
                ) : (
                    posts.map((post) => {
                        const firstImage = getLifelogFirstImage(post.content);

                        return (
                            <Link
                                key={post.id}
                                href={`/posts/${post.id}`}
                                className="mb-5 flex flex-col gap-2 border-b border-neutral-200 pb-5 text-neutral-400 last:border-b-0 last:pb-0"
                            >
                                <div className="mb-1 flex items-center gap-2">
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
                                                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-1.5 py-0 text-[11px] leading-4 text-blue-700">
                                                    {
                                                        post.user.affiliatedUniv
                                                            .name
                                                    }
                                                </span>
                                            ) : null}
                                        </div>
                                        <span className="mt-0.5 text-xs">
                                            {formatToTimeAgo(
                                                post.created_at.toString(),
                                            )}
                                        </span>
                                    </div>
                                </div>
                                {firstImage ? (
                                    <div className="relative mb-1 aspect-video w-full overflow-hidden rounded-xl border border-neutral-200">
                                        <Image
                                            src={firstImage}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 640px"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : null}

                                <h2 className="text-lg font-semibold text-neutral-700">
                                    {post.title}
                                </h2>
                                <p className="line-clamp-2 leading-relaxed">
                                    {getLifelogPreview(post.content)}
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1">
                                        <EyeIcon className="size-4" />
                                        <span>{post.views}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-myblue *:flex *:items-center *:gap-1">
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

            <Link
                href={`/posts/create?tab=${currentTab}`}
                className="fixed bottom-20 right-10 size-15 text-myblue transition-colors hover:text-myblue/80"
            >
                <PlusCircleIcon />
            </Link>
        </div>
    );
}
