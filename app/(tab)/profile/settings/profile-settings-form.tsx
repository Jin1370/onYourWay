"use client";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { deleteAccount, logout, updateProfile } from "./action";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2000;
const WEBP_QUALITY = 0.86;

type ProfileSettingsFormProps = {
    user: {
        username: string;
        email: string | null;
        avatar: string | null;
        affiliatedUnivName: string | null;
    };
    status?: string;
};

export default function ProfileSettingsForm({
    user,
    status,
}: ProfileSettingsFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const deleteFormRef = useRef<HTMLFormElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(
        user.avatar || "https://blocks.astratic.com/img/user-img-small.png",
    );
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const optimizeImageForUpload = async (file: File) => {
        if (file.type === "image/gif") return file;
        if (!file.type.startsWith("image/") || file.size === 0) return file;

        const objectUrl = URL.createObjectURL(file);
        const image = new window.Image();
        image.decoding = "async";
        image.src = objectUrl;

        try {
            await new Promise<void>((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = () =>
                    reject(new Error("이미지를 불러올 수 없습니다."));
            });

            const shouldResize =
                image.width > MAX_IMAGE_DIMENSION ||
                image.height > MAX_IMAGE_DIMENSION;
            const shouldCompress = file.size > 2 * 1024 * 1024;
            if (!shouldResize && !shouldCompress) return file;

            const ratio = Math.min(
                1,
                MAX_IMAGE_DIMENSION / Math.max(image.width, image.height),
            );
            const targetWidth = Math.max(1, Math.round(image.width * ratio));
            const targetHeight = Math.max(1, Math.round(image.height * ratio));

            const canvas = document.createElement("canvas");
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const context = canvas.getContext("2d");
            if (!context) return file;

            context.drawImage(image, 0, 0, targetWidth, targetHeight);
            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, "image/webp", WEBP_QUALITY);
            });
            if (!blob) return file;
            if (blob.size >= file.size && file.size <= MAX_UPLOAD_BYTES) {
                return file;
            }

            const baseName = file.name.replace(/\.[^.]+$/, "");
            return new File([blob], `${baseName}.webp`, {
                type: "image/webp",
                lastModified: Date.now(),
            });
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    };

    const onAvatarChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const rawFile = event.target.files?.[0];
        if (!rawFile) return;
        if (!rawFile.type.startsWith("image/")) {
            alert("이미지 파일만 업로드해주세요.");
            return;
        }

        const optimized = await optimizeImageForUpload(rawFile);
        if (optimized.size > MAX_UPLOAD_BYTES) {
            alert("이미지는 8MB 이하만 업로드할 수 있습니다.");
            return;
        }

        const transfer = new DataTransfer();
        transfer.items.add(optimized);
        event.target.files = transfer.files;
        setPreviewUrl(URL.createObjectURL(optimized));
    };

    const onConfirmDelete = () => {
        setIsDeleteModalOpen(false);
        deleteFormRef.current?.requestSubmit();
    };

    return (
        <div className="p-5 pt-3 pb-20">
            {status === "saved" ? (
                <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    프로필이 저장되었습니다.
                </p>
            ) : null}
            {status === "duplicate" ? (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    이미 사용 중인 닉네임입니다.
                </p>
            ) : null}
            {status === "invalid" ? (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    입력값을 확인해주세요.
                </p>
            ) : null}

            <form
                action={updateProfile}
                className="rounded-xl border border-neutral-200 bg-white p-4"
            >
                <div className="mb-4">
                    <p className="mb-2 block text-sm font-medium text-neutral-700">
                        프로필 사진
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="relative size-18 overflow-hidden rounded-full border border-neutral-200">
                            <Image
                                src={previewUrl}
                                alt={user.username}
                                fill
                                className="object-cover"
                                sizes="72px"
                            />
                        </div>
                        <label
                            htmlFor="avatarFile"
                            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
                        >
                            <PencilSquareIcon className="size-4" />
                            수정
                        </label>
                    </div>
                    <input
                        ref={fileInputRef}
                        id="avatarFile"
                        type="file"
                        name="avatarFile"
                        accept="image/*"
                        className="hidden"
                        onChange={onAvatarChange}
                    />
                </div>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                        닉네임
                    </label>
                    <input
                        type="text"
                        name="username"
                        defaultValue={user.username}
                        className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-myblue"
                    />
                </div>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                        이메일
                    </label>
                    <input
                        type="text"
                        value={user.email ?? "이메일 미등록"}
                        disabled
                        className="h-10 w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 text-sm text-neutral-500"
                    />
                </div>

                <div className="mb-5">
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                        소속대학
                    </label>
                    <div className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2.5 text-sm">
                        <span className="text-neutral-700">
                            {user.affiliatedUnivName ?? "소속대학 미등록"}
                        </span>
                        <Link
                            href="/profile/add-affiliated-univ?returnTo=%2Fprofile%2Fsettings"
                            className="inline-flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
                        >
                            <PencilSquareIcon className="size-4" />
                            {user.affiliatedUnivName ? "변경" : "등록"}
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-lg bg-myblue px-4 py-2.5 text-sm font-semibold text-white hover:bg-myblue/90"
                >
                    저장
                </button>
            </form>

            <div className="mt-6 flex flex-col gap-2">
                <form action={logout}>
                    <button
                        type="submit"
                        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                        로그아웃
                    </button>
                </form>
                <form ref={deleteFormRef} action={deleteAccount}>
                    <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                        회원탈퇴
                    </button>
                </form>
            </div>

            {isDeleteModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-center text-lg font-bold text-neutral-800">
                            회원탈퇴
                        </h3>
                        <p className="mt-2 text-center text-sm text-neutral-500">
                            정말로 탈퇴하시겠습니까?
                            <br />
                            탈퇴 후에는 복구할 수 없습니다.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 rounded-xl bg-neutral-100 py-3 font-semibold text-neutral-600 active:bg-neutral-200"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={onConfirmDelete}
                                className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white active:bg-red-600"
                            >
                                탈퇴
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
