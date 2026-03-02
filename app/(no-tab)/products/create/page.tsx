"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { useActionState, useState } from "react";
import InputContent from "@/components/input-content";
import { createProduct } from "./action";
import { PhotoIcon } from "@heroicons/react/24/solid";

export default function CreateProduct() {
    const [preview, setPreview] = useState("");
    const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {
            target: { files },
        } = event;
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 업로드해주세요.");
            return;
        }
        const maxSize = 3 * 1024 * 1024; //3MB(1MB=1024*1024bytes)
        if (file.size > maxSize) {
            alert("3MB 이하만 업로드 할 수 있습니다.");
            return;
        }
        const url = URL.createObjectURL(file); //임시로 URL 생성. 현재 브라우저 탭의 메모리에만 존재하고 페이지를 새로고침하거나 탭을 닫으면 사라짐
        setPreview(url);
    };

    const [state, trigger] = useActionState(createProduct, null);
    return (
        <div className="flex flex-col text-base min-h-screen py-10 px-8 gap-4">
            <form
                action={trigger}
                noValidate
                className="flex flex-col gap-3"
            >
                <label
                    htmlFor="photo" //id="photo"인 input과 label을 연결
                    className="border-2 aspect-square flex flex-col items-center justify-center text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
                    style={{
                        backgroundImage: `url(${preview})`,
                    }}
                >
                    {preview === "" ? (
                        <>
                            <PhotoIcon className="w-20" />
                            <div className="text-neutral-400 text-sm">
                                사진을 추가해주세요.
                                <p className="text-red-500">
                                    {state?.fieldErrors.photo}
                                </p>
                            </div>
                        </>
                    ) : null}
                </label>
                <input
                    onChange={onImageChange}
                    type="file"
                    id="photo"
                    name="photo"
                    className="hidden"
                />
                <Input
                    type="text"
                    placeholder="상품명"
                    required
                    name="title"
                    errors={state?.fieldErrors.title}
                />
                <InputContent
                    placeholder="설명"
                    required
                    name="description"
                    errors={state?.fieldErrors.description}
                    rowsNum={5}
                />
                <Input
                    type="number"
                    placeholder="가격"
                    required
                    name="price"
                    errors={state?.fieldErrors.price}
                />
                {state?.formErrors?.length ? (
                    <div className="flex flex-col gap-2">
                        {state.formErrors.map((error: string, idx: number) => (
                            <span key={idx} className="text-red-500 text-sm">
                                {error}
                            </span>
                        ))}
                    </div>
                ) : null}
                <Button text="등록" />
            </form>
        </div>
    );
}
