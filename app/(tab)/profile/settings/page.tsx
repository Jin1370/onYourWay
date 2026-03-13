import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import ProfileSettingsForm from "./profile-settings-form";

async function getUser() {
    const session = await getSession();
    if (!session.id) {
        return null;
    }

    return db.user.findUnique({
        where: { id: session.id },
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

export default async function ProfileSettings({
    searchParams,
}: {
    searchParams?: Promise<{ status?: string }>;
}) {
    const user = await getUser();
    if (!user) {
        redirect("/login");
    }

    const resolved = searchParams ? await searchParams : undefined;

    return (
        <ProfileSettingsForm
            user={{
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                affiliatedUnivName: user.affiliatedUniv?.name ?? null,
            }}
            status={resolved?.status}
        />
    );
}
