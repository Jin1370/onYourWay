import db from "@/lib/db";
import getSession from "@/lib/session";
import { NextResponse } from "next/server";

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getSession();
    if (!session.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: chatRoomId } = await params;

    // deleteMany는 대상이 없어도 에러를 던지지 않아 동시 요청(같은 유저의 두 탭 등)에 안전하다.
    // 삭제된 행 수가 0이면 애초에 멤버가 아니었던 것 → 404.
    const { count } = await db.chatRoomMember.deleteMany({
        where: {
            chatRoomId,
            userId: session.id,
        },
    });

    if (count === 0) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const remainingMembers = await db.chatRoomMember.count({
        where: {
            chatRoomId,
        },
    });

    if (remainingMembers === 0) {
        // 마지막 멤버가 나가면 방 삭제. 이미 삭제됐어도 에러 안 나도록 deleteMany 사용.
        await db.chatRoom.deleteMany({
            where: {
                id: chatRoomId,
            },
        });
    }

    return NextResponse.json({ ok: true, left: true });
}
