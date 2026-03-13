"use client";

import Button from "@/components/button";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { resendVerificationEmail } from "./action";

export default function VerifyEmailPage() {
    const [state, formAction] = useActionState(resendVerificationEmail, null);
    const searchParams = useSearchParams();
    const email = searchParams.get("email") ?? "";
    const sent = searchParams.get("sent");
    const status = searchParams.get("status");

    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h1 className="text-xl font-semibold">이메일 인증</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    <strong>{email || "입력한 이메일"}</strong>로 인증 링크를
                    보냈습니다. 메일의 링크를 눌러 계정을 활성화해주세요.
                </p>

                {sent === "0" ? (
                    <p className="mt-3 text-sm text-red-500">
                        초기 메일 전송에 실패했습니다. 환경변수를 확인한 뒤 다시
                        시도해주세요.
                    </p>
                ) : null}

                {status === "invalid" ? (
                    <p className="mt-3 text-sm text-red-500">
                        유효하지 않은 인증 링크입니다.
                    </p>
                ) : null}

                {status === "expired" ? (
                    <p className="mt-3 text-sm text-red-500">
                        인증 링크가 만료되었습니다. 인증 메일을 다시 보내주세요.
                    </p>
                ) : null}

                {status === "used" ? (
                    <p className="mt-3 text-sm text-neutral-600">
                        이미 사용된 인증 링크입니다. 로그인해 주세요.
                    </p>
                ) : null}

                <form action={formAction} className="mt-5">
                    <input type="hidden" name="email" value={email} />
                    <Button text="인증 메일 재전송" />
                </form>

                {state ? (
                    <p
                        className={`mt-3 text-sm ${state.ok ? "text-green-600" : "text-red-500"}`}
                    >
                        {state.message}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
