import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import CreatePostForm from "./create-post-form";

export default async function CreatePost({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const session = await getSession();
    if (!session.id) {
        redirect("/login");
    }
    const { tab } = await searchParams;
    const currentTab: "lifelog" | "free" =
        tab === "free" ? "free" : "lifelog";

    const user = await db.user.findUnique({
        where: {
            id: session.id,
        },
        select: {
            foreignAffiliatedUnivId: true,
        },
    });

    return (
        <CreatePostForm
            tab={currentTab}
            canWriteLifelog={Boolean(user?.foreignAffiliatedUnivId)}
        />
    );
}


