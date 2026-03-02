"use server";

import db from "@/lib/db";
import { getUniversityDetails } from "@/lib/university-details";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

export async function saveUnivInterest(univId: number) {
    const session = await getSession();
    let targetChatRoomId = "";
    try {
        await db.user.update({
            where: {
                id: session.id!,
            },
            data: {
                interestedUnivs: {
                    connect: {
                        id: univId,
                    },
                },
            },
        });
        //대학 채팅방이 있는지 확인, 없으면 생성
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
        targetChatRoomId = chatRoom.id;
        //채팅방 멤버로 추가
        await db.chatRoomMember.upsert({
            where: {
                userId_chatRoomId: {
                    userId: session.id!,
                    chatRoomId: chatRoom.id,
                },
            },
            update: {}, //이미 있다면 업데이트 할 내용 없음
            create: {
                userId: session.id!,
                chatRoomId: chatRoom.id,
            },
        });
    } catch (e) {
        throw new Error("관심 학교를 추가하는 데 실패했습니다.");
    }
    redirect("/profile");
}
export { getUniversityDetails };
