"use client";

import { HandThumbUpIcon as SolidHandThumbUpIcon } from "@heroicons/react/24/solid";
import { HandThumbUpIcon as OutlineHandThumbUpIcon } from "@heroicons/react/24/outline";
import { startTransition, useOptimistic } from "react";
import { dislikePost, likePost } from "@/app/(no-tab)/posts/[id]/action";

interface LikeButtonProps {
    isLiked: boolean;
    likeCount: number;
    postId: number;
}

export default function LikeButton({
    isLiked,
    likeCount,
    postId,
}: LikeButtonProps) {
    //첫번째 인자: 기존 데이터
    //두번째 인자: 데이터 수정 함수 (이전 상태, 핵심 데이터)
    const [state, toggleFn] = useOptimistic(
        { isLiked, likeCount },
        (previousState, payload) => {
            return {
                isLiked: !previousState.isLiked,
                likeCount: previousState.isLiked
                    ? previousState.likeCount - 1
                    : previousState.likeCount + 1,
            };
        },
    );
    const onClick = () => {
        const prevLiked = state.isLiked;
        startTransition(async () => {
            //startTransition: 조금 늦게 처리해도 되니까, 사용자가 클릭하는 동안 화면이 멈추지 않게 해줘
            toggleFn(undefined);
            if (prevLiked) {
                await dislikePost(postId);
            } else {
                await likePost(postId);
            }
        });
    };
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 text-mygray text-sm border border-neutral-400 rounded-full p-2 transition-colors 
                            ${state.isLiked ? "bg-myblue text-white border-myblue" : " hover:bg-blue-100"}`}
        >
            {state.isLiked ? (
                <SolidHandThumbUpIcon className="size-5" />
            ) : (
                <OutlineHandThumbUpIcon className="size-5" />
            )}
            <span>{state.likeCount}</span>
        </button>
    );
}
