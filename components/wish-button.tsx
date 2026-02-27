"use client";

import { HeartIcon as SolidHeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeartIcon } from "@heroicons/react/24/outline";
import { startTransition, useOptimistic } from "react";
import {
    unWishProduct,
    wishProduct,
} from "@/app/(no-tab)/products/[id]/action";

interface WishButtonProps {
    isWished: boolean;
    wishCount: number;
    productId: number;
}

export default function WishButton({
    isWished,
    wishCount,
    productId,
}: WishButtonProps) {
    //첫번째 인자: 기존 데이터
    //두번째 인자: 데이터 수정 함수 (이전 상태, 핵심 데이터)
    const [state, toggleFn] = useOptimistic(
        { isWished, wishCount },
        (previousState, payload) => {
            return {
                isWished: !previousState.isWished,
                wishCount: previousState.isWished
                    ? previousState.wishCount - 1
                    : previousState.wishCount + 1,
            };
        },
    );
    const onClick = () => {
        const prevLiked = state.isWished;
        startTransition(async () => {
            //startTransition: 조금 늦게 처리해도 되니까, 사용자가 클릭하는 동안 화면이 멈추지 않게 해줘
            toggleFn(undefined);
            if (prevLiked) {
                await unWishProduct(productId);
            } else {
                await wishProduct(productId);
            }
        });
    };
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 text-mygray text-sm border border-neutral-400 rounded-full p-2 transition-colors 
                            ${state.isWished ? "bg-myblue text-white border-myblue" : " hover:bg-blue-100"}`}
        >
            {state.isWished ? (
                <SolidHeartIcon className="size-5" />
            ) : (
                <OutlineHeartIcon className="size-5" />
            )}
            <span>{state.wishCount}</span>
        </button>
    );
}
