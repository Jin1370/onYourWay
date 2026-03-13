import db from "@/lib/db";
import getSession from "@/lib/session";
import { AcademicCapIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
    GlobeAsiaAustraliaIcon,
    ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getUserProfile() {
    const session = await getSession();
    if (!session.id) {
        return null;
    }
    return db.user.findUnique({
        where: {
            id: session.id,
        },
        select: {
            username: true,
            email: true,
            avatar: true,
            affiliatedUniv: {
                select: {
                    name: true,
                },
            },
        },
    });
}

export default async function Profile() {
    const user = await getUserProfile();
    if (!user) {
        redirect("/login");
    }

    return (
        <div className="flex flex-col p-5 pb-20 gap-4">
            <div className="flex items-center gap-4 p-4 mb-5 rounded-xl border border-neutral-200 bg-white shadow-sm">
                <Image
                    width={64}
                    height={64}
                    className="size-16 rounded-full object-cover border border-neutral-200"
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.username}
                />
                <div className="flex flex-col gap-2">
                    <span className="text-lg font-semibold text-neutral-800">
                        {user.username}
                    </span>
                    <div className="flex flex-col gap-0.5 text-sm text-neutral-500">
                        <div className="flex">
                            <span className="w-15">이메일</span>
                            <span>{user.email ?? "이메일 미등록"}</span>
                        </div>
                        <div className="flex">
                            <span className="w-15">소속대학</span>
                            <div className="flex items-center gap-2">
                                <span>
                                    {user.affiliatedUniv?.name ??
                                        "소속대학 미등록"}
                                </span>
                                <Link
                                    href="/profile/add-affiliated-univ"
                                    className="rounded-md border border-neutral-300 px-2 py-0.5 text-xs text-neutral-700 hover:bg-neutral-100"
                                >
                                    {user.affiliatedUniv ? "수정" : "등록하기"}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-md mb-5">
                <p className="font-semibold text-neutral-800 mb-2 flex items-center gap-1">
                    포스트
                    <GlobeAsiaAustraliaIcon className="w-4 h-4 text-neutral-500" />
                </p>
                <div className="flex flex-col gap-2">
                    <Link
                        href="/profile/my-posts"
                        className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 hover:bg-neutral-50"
                    >
                        <span>작성한 포스트</span>
                        <ChevronRightIcon className="size-4 text-neutral-500" />
                    </Link>
                    <Link
                        href="/profile/commented-posts"
                        className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 hover:bg-neutral-50"
                    >
                        <span>댓글 단 포스트</span>
                        <ChevronRightIcon className="size-4 text-neutral-500" />
                    </Link>
                    <Link
                        href="/profile/liked-posts"
                        className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 hover:bg-neutral-50"
                    >
                        <span>좋아요 한 포스트</span>
                        <ChevronRightIcon className="size-4 text-neutral-500" />
                    </Link>
                </div>
            </div>

            <div className="text-md mb-5">
                <p className="font-semibold text-neutral-800 mb-2 flex items-center gap-1">
                    중고거래
                    <ShoppingBagIcon className="w-4 h-4 text-neutral-500" />
                </p>
                <div className="flex flex-col gap-2">
                    <Link
                        href="/profile/my-products"
                        className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 hover:bg-neutral-50"
                    >
                        <span>등록한 상품</span>
                        <ChevronRightIcon className="size-4 text-neutral-500" />
                    </Link>
                    <Link
                        href="/profile/wished-products"
                        className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 hover:bg-neutral-50"
                    >
                        <span>찜한 상품</span>
                        <ChevronRightIcon className="size-4 text-neutral-500" />
                    </Link>
                </div>
            </div>
            <div className="text-md mb-5">
                <p className="font-semibold text-neutral-800 mb-2 flex items-center gap-1">
                    대학
                    <AcademicCapIcon className="w-4 h-4 text-neutral-500" />
                </p>
                <div className="flex flex-col gap-2">
                    <Link
                        href="/profile/my-univ-interests"
                        className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 hover:bg-neutral-50"
                    >
                        <span>내 관심 대학</span>
                        <ChevronRightIcon className="size-4 text-neutral-500" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
