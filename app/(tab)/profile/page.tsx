import db from "@/lib/db";
import getSession from "@/lib/session";
import {
    AcademicCapIcon,
    ChevronRightIcon,
    Cog8ToothIcon,
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
        <div className="flex flex-col gap-4 p-5 pt-3 pb-20">
            <div className="relative mb-5 flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <Link
                    href="/profile/settings"
                    className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-700"
                    aria-label="프로필 설정"
                >
                    <Cog8ToothIcon className="size-5" />
                </Link>
                <Image
                    width={64}
                    height={64}
                    className="size-16 rounded-full border border-neutral-200 object-cover"
                    src={
                        user.avatar ||
                        "https://blocks.astratic.com/img/user-img-small.png"
                    }
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
                            <span>
                                {user.affiliatedUniv?.name ?? "소속대학 미등록"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-md mb-3">
                <p className="mb-2 flex items-center gap-1 font-semibold text-neutral-800">
                    포스트
                    <GlobeAsiaAustraliaIcon className="h-4 w-4 text-neutral-500" />
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
                        <span>좋아요 누른 포스트</span>
                        <ChevronRightIcon className="size-4 text-neutral-500" />
                    </Link>
                </div>
            </div>

            <div className="text-md mb-3">
                <p className="mb-2 flex items-center gap-1 font-semibold text-neutral-800">
                    중고거래
                    <ShoppingBagIcon className="h-4 w-4 text-neutral-500" />
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

            <div className="text-md mb-3">
                <p className="mb-2 flex items-center gap-1 font-semibold text-neutral-800">
                    대학
                    <AcademicCapIcon className="h-4 w-4 text-neutral-500" />
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
