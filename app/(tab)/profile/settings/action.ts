"use server";

import db from "@/lib/db";
import fs from "fs/promises";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

const profileSchema = z.object({
    username: z.string().trim().min(1, "닉네임을 입력해주세요."),
});

export async function updateProfile(formData: FormData) {
    const session = await getSession();
    if (!session.id) {
        redirect("/login");
    }

    const parsed = profileSchema.safeParse({
        username: formData.get("username"),
    });

    if (!parsed.success) {
        redirect("/profile/settings?status=invalid");
    }

    const username = parsed.data.username;
    const duplicated = await db.user.findFirst({
        where: {
            username,
            NOT: {
                id: session.id,
            },
        },
        select: { id: true },
    });

    if (duplicated) {
        redirect("/profile/settings?status=duplicate");
    }

    const avatarFile = formData.get("avatarFile");
    let uploadedAvatarUrl: string | null | undefined = undefined;
    if (avatarFile instanceof File && avatarFile.size > 0) {
        const allowedImageTypes = new Set([
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
        ]);
        const extMap: Record<string, string> = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/gif": ".gif",
        };

        if (!allowedImageTypes.has(avatarFile.type)) {
            redirect("/profile/settings?status=invalid");
        }
        if (avatarFile.size > 8 * 1024 * 1024) {
            redirect("/profile/settings?status=invalid");
        }

        await fs.mkdir("./public/uploads/profiles", { recursive: true });
        const ext = extMap[avatarFile.type] ?? ".jpg";
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const photoData = await avatarFile.arrayBuffer();
        await fs.writeFile(
            `./public/uploads/profiles/${safeName}`,
            Buffer.from(photoData),
        );
        uploadedAvatarUrl = `/uploads/profiles/${safeName}`;
    }

    await db.user.update({
        where: { id: session.id },
        data: {
            username,
            ...(uploadedAvatarUrl !== undefined
                ? { avatar: uploadedAvatarUrl }
                : {}),
        },
    });

    redirect("/profile/settings?status=saved");
}

export async function logout() {
    const session = await getSession();
    await session.destroy();
    redirect("/login");
}

export async function deleteAccount() {
    const session = await getSession();
    if (!session.id) {
        redirect("/login");
    }

    const userId = session.id;

    await db.$transaction(async (tx) => {
        await tx.message.deleteMany({ where: { userId } });
        await tx.chatRoomMember.deleteMany({ where: { userId } });
        await tx.user.update({
            where: { id: userId },
            data: {
                interestedUnivs: {
                    set: [],
                },
                foreignAffiliatedUniv: {
                    disconnect: true,
                },
                domesticAffiliatedUniv: {
                    disconnect: true,
                },
            },
        });
        await tx.user.delete({ where: { id: userId } });
    });

    await session.destroy();
    redirect("/");
}

