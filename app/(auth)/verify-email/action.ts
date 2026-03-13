"use server";

import db from "@/lib/db";
import { sendEmailVerificationForUser } from "@/lib/email-verification";

interface ResendState {
    ok: boolean;
    message: string;
}

export async function resendVerificationEmail(
    prevState: ResendState | null,
    formData: FormData,
): Promise<ResendState> {
    const email = String(formData.get("email") ?? "")
        .trim()
        .toLowerCase();

    if (!email) {
        return {
            ok: false,
            message: "이메일이 필요합니다.",
        };
    }

    const user = await db.user.findUnique({
        where: { email },
        select: {
            id: true,
            emailVerifiedAt: true,
            email: true,
        },
    });

    if (!user) {
        return {
            ok: false,
            message: "해당 이메일로 가입된 계정을 찾을 수 없습니다.",
        };
    }

    if (user.emailVerifiedAt) {
        return {
            ok: true,
            message: "이미 인증이 완료된 이메일입니다.",
        };
    }

    const sent = await sendEmailVerificationForUser(user.id, user.email ?? "");
    if (!sent.ok) {
        return {
            ok: false,
            message:
                sent.error ??
                "메일 전송에 실패했습니다. RESEND_API_KEY와 MAIL_FROM 값을 확인해주세요.",
        };
    }

    return {
        ok: true,
        message: "인증 메일을 전송했습니다.",
    };
}
