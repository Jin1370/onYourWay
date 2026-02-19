"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { useActionState, useState } from "react";
import InputContent from "@/components/input-content";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { updateProduct } from "./action";

export default function EditProductForm({
    product,
}: {
    product: {
        photo: string;
        id: number;
        title: string;
        description: string;
        price: number;
    };
}) {
    const [preview, setPreview] = useState(product.photo);
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
        const maxSize = 3 * 1024 * 1024;
        if (file.size > maxSize) {
            alert("3MB 이하만 업로드 할 수 있습니다.");
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
    };
    const [state, trigger] = useActionState(
        updateProduct.bind(null, product.id),
        null,
    );
    return (
        <div className="flex flex-col text-base min-h-screen py-10 px-8 gap-4">
            <form action={trigger} noValidate className="flex flex-col gap-3">
                <label
                    htmlFor="photo"
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
                {/* 기존 사진 정보도 같이 전송 */}
                <input type="hidden" name="prevPhoto" value={product.photo} />
                <Input
                    type="text"
                    placeholder="상품명"
                    required
                    name="title"
                    defaultValue={product.title}
                    errors={state?.fieldErrors.title}
                />
                <InputContent
                    placeholder="설명"
                    required
                    name="description"
                    defaultValue={product.description}
                    errors={state?.fieldErrors.description}
                    rowsNum={5}
                />
                <Input
                    type="number"
                    placeholder="가격"
                    required
                    name="price"
                    defaultValue={product.price}
                    errors={state?.fieldErrors.price}
                />
                <Button text="등록" />
            </form>
        </div>
    );
}
