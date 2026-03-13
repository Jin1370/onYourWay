"use client";

import { usePathname } from "next/navigation";

function getTitle(pathname: string) {
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

    if (!title) return null;

    return (
        <header className="px-5 pt-5">
            <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
        </header>
    );
}
