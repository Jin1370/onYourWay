"use client";

import { dislikeComment, likeComment } from "@/app/(no-tab)/posts/[id]/action";
import { HandThumbUpIcon as SolidHandThumbUpIcon } from "@heroicons/react/24/solid";
import { HandThumbUpIcon as OutlineHandThumbUpIcon } from "@heroicons/react/24/outline";
import { startTransition, useState } from "react";

interface CommentLikeButtonProps {
    isLiked: boolean;
    likeCount: number;
    postId: number;
    commentId: number;
}

export default function CommentLikeButton({
    isLiked,
    likeCount,
    postId,
    commentId,
}: CommentLikeButtonProps) {
    // 전체 새로고침 없이 확정 상태를 로컬에서 관리(낙관적 업데이트 + 실패 시 롤백).
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
                    await dislikeComment(postId, commentId);
                } else {
                    await likeComment(postId, commentId);
                }
            } catch {
                setState(prev); // 실패 시 롤백
            }
        });
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-1 text-sm rounded-full px-2 py-1 transition-colors ${
                state.isLiked ? "text-myblue" : "text-mygray hover:text-myblue"
            }`}
        >
            {state.isLiked ? (
                <SolidHandThumbUpIcon className="size-3.5" />
            ) : (
                <OutlineHandThumbUpIcon className="size-3.5" />
            )}
            <span>{state.likeCount}</span>
        </button>
    );
}
