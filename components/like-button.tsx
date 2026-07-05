"use client";

import { HandThumbUpIcon as SolidHandThumbUpIcon } from "@heroicons/react/24/solid";
import { HandThumbUpIcon as OutlineHandThumbUpIcon } from "@heroicons/react/24/outline";
import { startTransition, useState } from "react";
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
    // 서버를 전체 재검증(새로고침)하지 않으므로, 확정 상태를 로컬에서 관리한다.
    // 클릭 즉시 UI를 바꾸고(낙관적), 서버 요청이 실패하면 되돌린다.
    const [state, setState] = useState({ isLiked, likeCount });
    const onClick = () => {
        const prev = state;
        const next = {
            isLiked: !prev.isLiked,
            likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
        };
        setState(next);
        startTransition(async () => {
            try {
                if (prev.isLiked) {
                    await dislikePost(postId);
                } else {
                    await likePost(postId);
                }
            } catch {
                setState(prev); // 실패 시 롤백
            }
        });
    };
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 text-mygray text-sm border border-neutral-400 rounded-full py-1.5 px-2 transition-colors 
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
