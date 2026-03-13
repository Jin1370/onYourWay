const RESEND_API_URL = "https://api.resend.com/emails";

interface SendVerificationEmailInput {
    to: string;
    verificationLink: string;
}

export interface SendEmailResult {
    ok: boolean;
    error?: string;
    messageId?: string;
}

function getMailConfig() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;

    if (!apiKey || !from) {
        return null;
    }

    return { apiKey, from };
}

export async function sendVerificationEmail({
    to,
    verificationLink,
}: SendVerificationEmailInput) {
    const config = getMailConfig();
    if (!config) {
        return {
            ok: false,
            error: "RESEND_API_KEY 또는 MAIL_FROM 값이 설정되지 않았습니다.",
        } satisfies SendEmailResult;
    }

    try {
        const response = await fetch(RESEND_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: config.from,
                to,
                subject: "[On Your Way] 이메일 인증을 완료해주세요",
                html: `
                    <div>
                        <h2>On Your Way 이메일 인증</h2>
                        <p>아래 링크를 눌러 이메일 인증을 완료해주세요.</p>
                        <p><a href="${verificationLink}">이메일 인증하기</a></p>
                        <p>이 링크는 30분 후 만료됩니다.</p>
                    </div>
                `,
            }),
            cache: "no-store",
        });

        if (response.ok) {
            const bodyText = await response.text();
            let messageId: string | undefined;
            try {
                const parsed = JSON.parse(bodyText) as { id?: string };
                messageId = parsed.id;
            } catch {
                // Ignore parse failure on success payload.
            }

            return {
                ok: true,
                messageId,
            } satisfies SendEmailResult;
        }

        const bodyText = await response.text();
        let detail = bodyText;
        try {
            const parsed = JSON.parse(bodyText) as {
                message?: string;
                error?: string;
                name?: string;
            };
            detail = parsed.message ?? parsed.error ?? parsed.name ?? bodyText;
        } catch {
            // Use raw response text.
        }

        return {
            ok: false,
            error: `Resend ${response.status}: ${detail.slice(0, 180)}`,
        } satisfies SendEmailResult;
    } catch (error) {
        return {
            ok: false,
            error: `네트워크 오류: ${(error as Error).message}`,
        } satisfies SendEmailResult;
    }
}
