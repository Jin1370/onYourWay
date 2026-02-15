"use client";
import {
    ChatBubbleOvalLeftEllipsisIcon as SolidChatIcon,
    UserCircleIcon as SolidUserCircleIcon,
    ShoppingBagIcon as SolidShoppingBagIcon,
    AcademicCapIcon as SolidAcademicCapIcon,
    GlobeAsiaAustraliaIcon as SolidGlobeAsiaAustraliaIcon,
} from "@heroicons/react/24/solid";
import {
    ChatBubbleOvalLeftEllipsisIcon as OutlineChatIcon,
    UserCircleIcon as OutlineUserCircleIcon,
    ShoppingBagIcon as OutlineShoppingBagIcon,
    AcademicCapIcon as OutlineAcademicCapIcon,
    GlobeAsiaAustraliaIcon as OutlineGlobeAsiaAustraliaIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabBar() {
    const pathname = usePathname();
    return (
        <div className="fixed bottom-0 left-0 right-0 grid grid-cols-5 px-5 py-3 bg-indigo-50 *:text-neutral-500 *:mx-auto">
            <Link href="/posts">
                {pathname === "/posts" ? (
                    <SolidGlobeAsiaAustraliaIcon className="w-7 h-7 text-myblue" />
                ) : (
                    <OutlineGlobeAsiaAustraliaIcon className="w-7 h-7" />
                )}
            </Link>
            <Link href="/school">
                {pathname === "/school" ? (
                    <SolidAcademicCapIcon className="w-7 h-7 text-myblue" />
                ) : (
                    <OutlineAcademicCapIcon className="w-7 h-7" />
                )}
            </Link>
            <Link href="/products">
                {pathname === "/products" ? (
                    <SolidShoppingBagIcon className="w-7 h-7 text-myblue" />
                ) : (
                    <OutlineShoppingBagIcon className="w-7 h-7" />
                )}
            </Link>
            <Link href="/chat">
                {pathname === "/chat" ? (
                    <SolidChatIcon className="w-7 h-7 text-myblue" />
                ) : (
                    <OutlineChatIcon className="w-7 h-7" />
                )}
            </Link>
            <Link href="/profile">
                {pathname === "/profile" ? (
                    <SolidUserCircleIcon className="w-7 h-7 text-myblue" />
                ) : (
                    <OutlineUserCircleIcon className="w-7 h-7" />
                )}
            </Link>
        </div>
    );
}
