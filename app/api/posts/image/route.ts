import getSession from "@/lib/session";
import { NextResponse } from "next/server";
import fs from "fs/promises";

export async function POST(request: Request) {
    const session = await getSession();
    if (!session.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }
    const allowedTypes = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    ]);
    if (!allowedTypes.has(file.type)) {
        return NextResponse.json(
            { error: "Only jpg, png, webp, gif are allowed" },
            { status: 400 },
        );
    }
    if (file.size > 3 * 1024 * 1024) {
        return NextResponse.json({ error: "Image must be 3MB or less" }, { status: 400 });
    }

    await fs.mkdir("./public/uploads/posts", { recursive: true });
    const extMap: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    };
    const extension = extMap[file.type] ?? ".jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(`./public/uploads/posts/${fileName}`, buffer);

    return NextResponse.json({ url: `/uploads/posts/${fileName}` });
}
