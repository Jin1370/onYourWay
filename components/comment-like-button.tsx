"use client";

import { dislikeComment, likeComment } from "@/app/(no-tab)/posts/[id]/action";
import { HandThumbUpIcon as SolidHandThumbUpIcon } from "@heroicons/react/24/solid";
import { HandThumbUpIcon as OutlineHandThumbUpIcon } from "@heroicons/react/24/outline";
import { startTransition, useOptimistic } from "react";

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
    const [state, toggleFn] = useOptimistic(
        { isLiked, likeCount },
        (previousState) => {
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
            toggleFn(undefined);
            if (prevLiked) {
                await dislikeComment(postId, commentId);
            } else {
                await likeComment(postId, commentId);
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
