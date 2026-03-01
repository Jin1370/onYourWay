import db from "@/lib/db";
import getSession from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const token = body?.token;
    if (typeof token !== "string" || !token.trim()) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    await db.user.update({
        where: {
            id: session.id,
        },
        data: {
            fcmToken: token.trim(),
        },
    });

    return NextResponse.json({ ok: true });
}
