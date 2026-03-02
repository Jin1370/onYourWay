import db from "@/lib/db";
import getSession from "@/lib/session";
import CreatePostForm from "./create-post-form";

export default async function CreatePost({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const session = await getSession();
    const { tab } = await searchParams;
    const currentTab: "lifelog" | "free" =
        tab === "free" ? "free" : "lifelog";

    const user = await db.user.findUnique({
        where: {
            id: session.id!,
        },
        select: {
            affiliatedUnivId: true,
        },
    });

    return (
        <CreatePostForm
            tab={currentTab}
            canWriteLifelog={Boolean(user?.affiliatedUnivId)}
        />
    );
}
