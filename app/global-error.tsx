"use client";

// 루트 레이아웃(app/layout.tsx) 자체에서 에러가 났을 때의 최후 폴백.
// 루트 레이아웃을 대체하므로 자체 <html>/<body>를 렌더링해야 한다.
import "./globals.css";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="ko">
            <body className="mx-auto max-w-screen-sm">
                <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
                    <h2 className="text-lg font-semibold text-neutral-800">
                        문제가 발생했습니다
                    </h2>
                    <p className="text-sm text-neutral-500">
                        페이지를 불러오지 못했어요. 다시 시도해주세요.
                    </p>
                    <button
                        type="button"
                        onClick={reset}
                        className="mt-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
                    >
                        다시 시도
                    </button>
                </div>
            </body>
        </html>
    );
}
