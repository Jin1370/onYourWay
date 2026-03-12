import db from "@/lib/db";
import getSession from "@/lib/session";
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
            <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
                <Image
                    width={64}
                    height={64}
                    className="size-16 rounded-full object-cover border border-neutral-200"
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.username}
                />
                <div className="flex flex-col">
                    <span className="text-lg font-semibold text-neutral-800">
                        {user.username}
                    </span>
                    <div className="flex flex-col text-sm text-neutral-500">
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
            <Link href="/profile/add-affiliated-univ" className="primary-btn">
                해외 소속 대학 등록하기
            </Link>
            <Link href="/profile/add-univ-interest" className="primary-btn">
                관심대학 추가하기
            </Link>
        </div>
    );
}
