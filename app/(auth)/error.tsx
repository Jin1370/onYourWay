"use client";

import ErrorFallback from "@/components/error-fallback";
import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    // 인증 영역은 아직 로그인 전이므로 홈 대신 로그인 화면으로 안내.
    return (
        <ErrorFallback reset={reset} homeHref="/login" homeLabel="로그인으로" />
    );
}
