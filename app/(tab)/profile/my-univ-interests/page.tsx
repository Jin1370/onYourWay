import db from "@/lib/db";
import getSession from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyUnivInterestsPage() {
    const session = await getSession();
    if (!session.id) {
        redirect("/login");
    }

    const user = await db.user.findUnique({
        where: {
            id: session.id,
        },
        select: {
            interestedUnivs: {
                select: {
                    id: true,
                    name: true,
                    country: true,
                },
                orderBy: {
                    name: "asc",
                },
            },
        },
    });

    const universities = user?.interestedUnivs ?? [];

    return (
        <div className="p-5 pb-20">
            {universities.length === 0 ? (
                <p className="text-center text-sm text-neutral-500">
                    관심 대학이 없습니다.
                </p>
            ) : (
                universities.map((univ) => (
                    <Link
                        key={univ.id}
                        href="/university"
                        className="mb-5 block border-b border-neutral-200 pb-4 text-neutral-700 last:border-b-0 last:pb-0"
                    >
                        <p className="text-base font-semibold">{univ.name}</p>
                        <p className="mt-1 text-sm text-neutral-500">
                            {univ.country ?? "국가 정보 없음"}
                        </p>
                    </Link>
                ))
            )}
        </div>
    );
}
