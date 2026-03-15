"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

function getTitle(pathname: string) {
    if (pathname.startsWith("/profile/my-posts"))
        return "프로필 > 작성한 포스트";
    if (pathname.startsWith("/profile/commented-posts"))
        return "프로필 > 댓글 단 포스트";
    if (pathname.startsWith("/profile/liked-posts"))
        return "프로필 > 좋아요 누른 포스트";
    if (pathname.startsWith("/profile/my-products"))
        return "프로필 > 등록한 상품";
    if (pathname.startsWith("/profile/wished-products"))
        return "프로필 > 찜한 상품";
    if (pathname.startsWith("/profile/my-univ-interests"))
        return "프로필 > 내 관심 대학";
    if (pathname.startsWith("/profile/add-univ-interest"))
        return "프로필 > 관심 대학 추가";
    if (pathname.startsWith("/profile/add-affiliated-univ"))
        return "프로필 > 소속 대학 등록";
    if (pathname.startsWith("/posts/ai")) return "💡AI 질문하기";
    if (pathname.startsWith("/posts")) return "포스트";
    if (pathname.startsWith("/products")) return "중고거래";
    if (pathname.startsWith("/chats")) return "채팅";
    if (pathname.startsWith("/university")) return "대학";
    if (pathname.startsWith("/profile")) return "내 프로필";
    return "";
}

export default function TabPageTitle() {
    const pathname = usePathname();
    const title = getTitle(pathname);
    const showUnivInterestAddButton = pathname.startsWith(
        "/profile/my-univ-interests",
    );
    const showAiButton = title === "포스트";

    if (!title) return null;

    return (
        <header className="flex items-center justify-between gap-3 px-5 pt-5">
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-neutral-900">
                    {title}
                </h1>
                {showUnivInterestAddButton ? (
                    <Link
                        href="/profile/add-univ-interest"
                        className="size-4 text-neutral-500 border border-neutral-300 rounded-md flex items-center justify-center hover:bg-neutral-100"
                        aria-label="관심 대학 추가"
                        title="관심 대학 추가"
                    >
                        <PlusIcon className="size-5" />
                    </Link>
                ) : null}
            </div>
            {showAiButton ? (
                <Link
                    href="/posts/ai"
                    className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-2 py-1 textarea-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                    💡AI 질문하기
                </Link>
            ) : null}
        </header>
    );
}
