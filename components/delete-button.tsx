"use client";

import { useState } from "react";

interface DeleteBtnProps {
    onDelete: () => Promise<void>;
}

export default function DeleteBtn({ onDelete }: DeleteBtnProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        await onDelete();
        setIsOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="text-sm border rounded-full p-2 w-14 bg-myblue text-white border-myblue hover:bg-myblue/80 transition-colors"
            >
                삭제
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-neutral-800 text-center">
                            게시글 삭제
                        </h3>
                        <p className="text-neutral-500 mt-2 text-sm text-center">
                            정말로 삭제하시겠습니까?
                            <br />
                            삭제 후에는 복구할 수 없습니다.
                        </p>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-3 font-semibold rounded-xl bg-neutral-100 text-neutral-600 active:bg-neutral-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 font-semibold rounded-xl bg-red-500 text-white active:bg-red-600"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
