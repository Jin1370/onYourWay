"use client";

import CommentLikeButton from "@/components/comment-like-button";
import { formatToTimeAgo } from "@/lib/utils";
import { TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type MouseEvent,
    type PointerEvent,
} from "react";
import { deleteComment } from "./action";

interface CommentUser {
    username: string;
    avatar: string | null;
}

interface CommentItem {
    id: number;
    content: string;
    created_at: string;
    userId: number;
    user: CommentUser;
    isLiked: boolean;
    likeCount: number;
}

interface CommentListProps {
    comments: CommentItem[];
    postId: number;
    sessionId: number;
}

export default function CommentList({
    comments,
    postId,
    sessionId,
}: CommentListProps) {
    const [menuState, setMenuState] = useState<{
        commentId: number;
        x: number;
        y: number;
    } | null>(null);
    const [deleteTargetCommentId, setDeleteTargetCommentId] = useState<
        number | null
    >(null);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );
    const isLongPressTriggeredRef = useRef(false);

    const selectedComment = useMemo(
        () => comments.find((comment) => comment.id === menuState?.commentId),
        [comments, menuState?.commentId],
    );

    const closeMenu = useCallback(() => {
        setMenuState(null);
    }, []);

    useEffect(() => {
        if (!menuState) return;
        const close = () => closeMenu();
        window.addEventListener("click", close);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
        return () => {
            window.removeEventListener("click", close);
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [closeMenu, menuState]);

    const clearLongPressTimer = () => {
        if (!longPressTimerRef.current) return;
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    };

    const openContextMenu = (
        commentId: number,
        clientX: number,
        clientY: number,
    ) => {
        setMenuState({
            commentId,
            x: clientX,
            y: clientY,
        });
    };

    const handlePointerDown = (
        commentId: number,
        event: PointerEvent<HTMLDivElement>,
        isOwnComment: boolean,
    ) => {
        if (!isOwnComment) return;
        if (event.pointerType !== "touch") return;
        isLongPressTriggeredRef.current = false;
        clearLongPressTimer();
        const { clientX, clientY } = event;
        longPressTimerRef.current = setTimeout(() => {
            isLongPressTriggeredRef.current = true;
            openContextMenu(commentId, clientX, clientY);
        }, 600);
    };

    const handlePointerUp = () => {
        clearLongPressTimer();
    };

    const handlePointerCancel = () => {
        clearLongPressTimer();
    };

    const handleContextMenu = (
        commentId: number,
        event: MouseEvent<HTMLDivElement>,
        isOwnComment: boolean,
    ) => {
        if (!isOwnComment) return;
        event.preventDefault();
        openContextMenu(commentId, event.clientX, event.clientY);
    };

    const openDeleteModal = () => {
        if (!selectedComment) return;
        setDeleteTargetCommentId(selectedComment.id);
        closeMenu();
    };

    const handleDeleteComment = async () => {
        if (!deleteTargetCommentId) return;
        await deleteComment(postId, deleteTargetCommentId);
        setDeleteTargetCommentId(null);
    };

    return (
        <>
            {comments.map((comment) => {
                const isOwnComment = sessionId === comment.userId;
                return (
                    <div
                        key={comment.id}
                        className="flex items-center justify-between py-5 border-t border-neutral-300 last:mb-0 text-sm"
                        onContextMenu={(event) =>
                            handleContextMenu(comment.id, event, isOwnComment)
                        }
                        onPointerDown={(event) =>
                            handlePointerDown(comment.id, event, isOwnComment)
                        }
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerCancel}
                        onPointerLeave={handlePointerCancel}
                        style={{
                            touchAction: "manipulation",
                            WebkitUserSelect: "none",
                            userSelect: "none",
                        }}
                    >
                        <div className="flex items-center gap-5">
                            <Image
                                width={28}
                                height={28}
                                className="size-7 rounded-full"
                                src={
                                    comment.user.avatar ||
                                    "https://blocks.astratic.com/img/user-img-small.png"
                                }
                                alt={comment.user.username}
                            />
                            <div className="flex flex-col">
                                <div>
                                    <span>{comment.user.username}</span>
                                    <span> · </span>
                                    <span className="text-xs">
                                        {formatToTimeAgo(comment.created_at)}
                                    </span>
                                </div>
                                <span>{comment.content}</span>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <CommentLikeButton
                                isLiked={comment.isLiked}
                                likeCount={comment.likeCount}
                                postId={postId}
                                commentId={comment.id}
                            />
                        </div>
                    </div>
                );
            })}

            {menuState && selectedComment ? (
                <div
                    className="fixed inset-0 z-50"
                    onClick={closeMenu}
                    onContextMenu={(event) => {
                        event.preventDefault();
                        closeMenu();
                    }}
                >
                    <div
                        className="absolute min-w-12 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg"
                        style={{
                            left: Math.max(menuState.x - 40, 12),
                            top: Math.max(menuState.y - 12, 12),
                        }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={openDeleteModal}
                            className="px-3 py-1.5 text-sm text-neutral-800 hover:text-red-500 flex items-center gap-1"
                            aria-label="댓글 삭제"
                            title="댓글 삭제"
                        >
                            <TrashIcon className="size-4" />
                            삭제
                        </button>
                    </div>
                </div>
            ) : null}
            {deleteTargetCommentId ? (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-center text-lg font-bold text-neutral-800">
                            댓글 삭제
                        </h3>
                        <p className="mt-2 text-center text-sm text-neutral-500">
                            정말로 삭제하시겠습니까?
                            <br />
                            삭제 후에는 복구할 수 없습니다.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTargetCommentId(null)}
                                className="flex-1 rounded-xl bg-neutral-100 py-3 font-semibold text-neutral-600 active:bg-neutral-200"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteComment}
                                className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white active:bg-red-600"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
