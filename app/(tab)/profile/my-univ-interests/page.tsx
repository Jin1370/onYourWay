import db from "@/lib/db";
import getSession from "@/lib/session";
import { TrashIcon } from "@heroicons/react/24/outline";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function removeUnivInterest(formData: FormData) {
    "use server";

    const session = await getSession();
    if (!session.id) {
        redirect("/login");
    }

    const univId = Number(formData.get("univId"));
    if (!Number.isInteger(univId) || univId <= 0) {
        return;
    }

    await db.user.update({
        where: {
            id: session.id,
        },
        data: {
            interestedUnivs: {
                disconnect: {
                    id: univId,
                },
            },
        },
    });

    revalidatePath("/profile/my-univ-interests");
    redirect("/profile/my-univ-interests");
}

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
                    <div
                        key={univ.id}
                        className="mb-5 flex items-center justify-between gap-3 border-b border-neutral-200 pb-4 text-neutral-700 last:border-b-0 last:pb-0"
                    >
                        <div className="min-w-0">
                            <p className="text-base font-semibold">
                                {univ.name}
                            </p>
                            <p className="mt-1 text-sm text-neutral-500">
                                {univ.country ?? "국가 정보 없음"}
                            </p>
                        </div>
                        <form action={removeUnivInterest}>
                            <input
                                type="hidden"
                                name="univId"
                                value={univ.id}
                            />
                            <button
                                type="submit"
                                className="px-3 py-1.5 hover:text-neutral-400 flex items-center text-mygray"
                                aria-label="관심 대학 삭제"
                                title="관심 대학 삭제"
                            >
                                <TrashIcon className="size-4" />
                            </button>
                        </form>
                    </div>
                ))
            )}
        </div>
    );
}
