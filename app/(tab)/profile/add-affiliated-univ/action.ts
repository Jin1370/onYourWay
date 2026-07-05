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
    try {
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

        // 동시 요청으로 방이 먼저 생성되면 universityId 유니크(P2002)가 날 수 있어
        // create 실패 시 다시 조회해서 이어간다.
        if (!chatRoom) {
            try {
                chatRoom = await db.chatRoom.create({
                    data: {
                        type: "UNIVERSITY",
                        universityId: univId,
                    },
                    select: {
                        id: true,
                    },
                });
            } catch {
                chatRoom = await db.chatRoom.findUnique({
                    where: { universityId: univId },
                    select: { id: true },
                });
            }
        }

        if (chatRoom) {
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
        }
    } catch (error) {
        console.error("Failed to save affiliated university:", error);
        throw new Error("소속 대학을 저장하는 데 실패했습니다.");
    }

    const safeReturnTo =
        returnTo === "/profile/settings" || returnTo === "/profile"
            ? returnTo
            : "/profile";
    redirect(safeReturnTo);
}
export { getUniversityDetails };
