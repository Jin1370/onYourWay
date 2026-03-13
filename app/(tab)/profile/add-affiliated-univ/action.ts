"use server";

import db from "@/lib/db";
import { getUniversityDetails } from "@/lib/university-details";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

export async function saveAffiliatedUniv(
    univId: number,
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
        data: {
            affiliatedUnivId: univId,
        },
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
        update: {},
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
