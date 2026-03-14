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
    const member = await db.chatRoomMember.findFirst({
        where: {
            chatRoomId,
            userId: session.id,
        },
        select: {
            id: true,
        },
    });

    if (!member) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    await db.chatRoomMember.delete({
        where: {
            id: member.id,
        },
    });

    const remainingMembers = await db.chatRoomMember.count({
        where: {
            chatRoomId,
        },
    });

    if (remainingMembers === 0) {
        await db.chatRoom.delete({
            where: {
                id: chatRoomId,
            },
        });
    }

    return NextResponse.json({ ok: true, left: true });
}
