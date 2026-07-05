"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// error.tsx들이 공유하는 에러 화면. "다시 시도(reset)" + 홈 이동을 제공한다.
export default function ErrorFallback({
    reset,
    title = "문제가 발생했습니다",
    description = "일시적인 오류일 수 있어요. 잠시 후 다시 시도해주세요.",
    homeHref = "/posts",
    homeLabel = "홈으로",
}: {
    reset: () => void;
    title?: string;
    description?: string;
    homeHref?: string;
    homeLabel?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-red-50">
                <ExclamationTriangleIcon className="size-7 text-red-400" />
            </div>
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-neutral-800">
                    {title}
                </h2>
                <p className="text-sm text-neutral-500">{description}</p>
            </div>
            <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
                <button
                    type="button"
                    onClick={reset}
                    className="w-full rounded-lg bg-myblue px-4 py-2.5 text-sm font-semibold text-white hover:bg-myblue/90"
                >
                    다시 시도
                </button>
                <Link
                    href={homeHref}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                    {homeLabel}
                </Link>
            </div>
        </div>
    );
}
