"use server";

import db from "@/lib/db";
import { getUniversityDetails } from "@/lib/university-details";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

export async function saveAffiliatedUniv(
    univId: number,
    type: "foreign" | "domestic",
    returnTo?: string,
) {
    const session = await getSession();
    if (!session.id) {
        redirect("/login");
    }
    await db.user.update({
        where: {
            id: session.id,
        },
        data:
            type === "foreign"
                ? { foreignAffiliatedUnivId: univId }
                : { domesticAffiliatedUnivId: univId },
    });

    let chatRoom = await db.chatRoom.findUnique({
        where: {
            universityId: univId,
        },
        select: {
            id: true,
        },
    });

    if (!chatRoom) {
        chatRoom = await db.chatRoom.create({
            data: {
                type: "UNIVERSITY",
                universityId: univId,
            },
            select: {
                id: true,
            },
        });
    }

    await db.chatRoomMember.upsert({
        where: {
            userId_chatRoomId: {
                userId: session.id,
                chatRoomId: chatRoom.id,
            },
        },
        update: {
            is_hidden: false,
            is_muted: false,
        },
        create: {
            userId: session.id,
            chatRoomId: chatRoom.id,
        },
    });

    const safeReturnTo =
        returnTo === "/profile/settings" || returnTo === "/profile"
            ? returnTo
            : "/profile";
    redirect(safeReturnTo);
}
export { getUniversityDetails };
