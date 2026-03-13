import { createHash, randomBytes } from "crypto";
import db from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

const TOKEN_TTL_MS = 30 * 60 * 1000;

function hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

function getBaseUrl() {
    return process.env.APP_BASE_URL ?? "http://localhost:3000";
}

export async function issueEmailVerificationToken(userId: number) {
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await db.emailVerificationToken.deleteMany({
        where: {
            userId,
            usedAt: null,
        },
    });

    await db.emailVerificationToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
        },
    });

    return rawToken;
}

export async function sendEmailVerificationForUser(userId: number, toEmail: string) {
    const rawToken = await issueEmailVerificationToken(userId);
    const verificationLink = `${getBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`;

    return sendVerificationEmail({
        to: toEmail,
        verificationLink,
    });
}

type VerifyResult = "VERIFIED" | "INVALID" | "EXPIRED" | "ALREADY_USED";

export async function verifyEmailToken(rawToken: string): Promise<VerifyResult> {
    const tokenHash = hashToken(rawToken);
    const token = await db.emailVerificationToken.findUnique({
        where: {
            tokenHash,
        },
        select: {
            id: true,
            userId: true,
            usedAt: true,
            expiresAt: true,
        },
    });

    if (!token) {
        return "INVALID";
    }

    if (token.usedAt) {
        return "ALREADY_USED";
    }

    if (token.expiresAt.getTime() < Date.now()) {
        return "EXPIRED";
    }

    await db.$transaction([
        db.emailVerificationToken.update({
            where: {
                id: token.id,
            },
            data: {
                usedAt: new Date(),
            },
        }),
        db.user.update({
            where: {
                id: token.userId,
            },
            data: {
                emailVerifiedAt: new Date(),
            },
        }),
    ]);

    return "VERIFIED";
}
