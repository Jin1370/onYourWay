"use client";

import { useMemo, useState } from "react";

interface DeleteBtnProps {
    onDelete: () => Promise<void>;
    triggerLabel?: string;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    triggerClassName?: string;
    triggerAriaLabel?: string;
    triggerTitle?: string;
    triggerIcon?: React.ReactNode;
    onTrigger?: () => void;
}

export default function DeleteBtn({
    onDelete,
    triggerLabel = "삭제",
    title = "게시글 삭제",
    description = "정말로 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.",
    confirmLabel = "삭제",
    cancelLabel = "취소",
    triggerClassName = "text-sm border rounded-full p-2 w-14 bg-myblue text-white border-myblue hover:bg-myblue/80 transition-colors",
    triggerAriaLabel,
    triggerTitle,
    triggerIcon,
    onTrigger,
}: DeleteBtnProps) {
    const [isOpen, setIsOpen] = useState(false);
    const descriptionLines = useMemo(
        () => description.split("\n"),
        [description],
    );

    const handleDelete = async () => {
        await onDelete();
        setIsOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    onTrigger?.();
                    setIsOpen(true);
                }}
                className={triggerClassName}
                aria-label={triggerAriaLabel}
                title={triggerTitle}
            >
                {triggerIcon ?? triggerLabel}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-neutral-800 text-center">
                            {title}
                        </h3>
                        <p className="text-neutral-500 mt-2 text-sm text-center">
                            {descriptionLines.map((line, index) => (
                                <span key={`${line}-${index}`}>
                                    {line}
                                    {index < descriptionLines.length - 1 ? (
                                        <br />
                                    ) : null}
                                </span>
                            ))}
                        </p>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-3 font-semibold rounded-xl bg-neutral-100 text-neutral-600 active:bg-neutral-200"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 font-semibold rounded-xl bg-red-500 text-white active:bg-red-600"
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
