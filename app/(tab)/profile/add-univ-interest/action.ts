"use server";

import db from "@/lib/db";
import { getUniversityDetails } from "@/lib/university-details";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

export async function saveUnivInterest(univId: number) {
    const session = await getSession();
    if (!session.id) {
        redirect("/login");
    }

    try {
        await db.user.update({
            where: {
                id: session.id,
            },
            data: {
                interestedUnivs: {
                    connect: {
                        id: univId,
                    },
                },
            },
        });

        let chatRoom = await db.chatRoom.findUnique({
            where: {
                universityId: univId,
            },
        });
        if (!chatRoom) {
            chatRoom = await db.chatRoom.create({
                data: {
                    type: "UNIVERSITY",
                    universityId: univId,
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
    } catch {
        throw new Error("관심 대학을 추가하는 데 실패했습니다.");
    }
    redirect("/profile");
}
export { getUniversityDetails };
