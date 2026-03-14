import db from "@/lib/db";
import getSession from "@/lib/session";
import { NextResponse } from "next/server";

async function getAuthorizedMember(chatRoomId: string, userId: number) {
    return db.chatRoomMember.findFirst({
        where: {
            chatRoomId,
            userId,
        },
        select: {
            id: true,
            is_muted: true,
            is_hidden: true,
        },
    });
}

export async function PATCH(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getSession();
    if (!session.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: chatRoomId } = await params;
    const member = await getAuthorizedMember(chatRoomId, session.id);
    if (!member) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const updated = await db.chatRoomMember.update({
        where: {
            id: member.id,
        },
        data: {
            is_muted: !member.is_muted,
        },
        select: {
            is_muted: true,
        },
    });

    return NextResponse.json({ ok: true, isMuted: updated.is_muted });
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getSession();
    if (!session.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: chatRoomId } = await params;
    const member = await getAuthorizedMember(chatRoomId, session.id);
    if (!member) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    await db.chatRoomMember.update({
        where: {
            id: member.id,
        },
        data: {
            is_hidden: true,
        },
    });
    return NextResponse.json({ ok: true, isHidden: true });
}
