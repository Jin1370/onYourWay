"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import InputContent from "@/components/input-content";
import ProductLocationPicker from "@/components/product-location-picker";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useActionState, useEffect, useState } from "react";
import { createProduct } from "./action";

export default function CreateProduct() {
    const [preview, setPreview] = useState("");
    const [state, trigger] = useActionState(createProduct, null);
    const [formValues, setFormValues] = useState({
        title: "",
        description: "",
        price: "",
        isMeetup: false,
        isDelivery: false,
    });

    useEffect(() => {
        const submitted = (state as any)?.values;
        if (!submitted) return;
        setFormValues({
            title: submitted.title ?? "",
            description: submitted.description ?? "",
            price: submitted.price ?? "",
            isMeetup: Boolean(submitted.isMeetup),
            isDelivery: Boolean(submitted.isDelivery),
        });
    }, [state]);

    useEffect(() => {
        if (state) setPreview("");
    }, [state]);

    const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 업로드해주세요.");
            return;
        }
        if (file.size > 3 * 1024 * 1024) {
            alert("3MB 이하 파일만 업로드할 수 있습니다.");
            return;
        }
        setPreview(URL.createObjectURL(file));
    };

    return (
        <div className="flex flex-col text-base min-h-screen py-10 px-8 gap-4">
            <h1 className="text-lg font-semibold">상품 등록</h1>
            <form action={trigger} noValidate className="flex flex-col gap-3">
                <label
                    htmlFor="photo"
                    className="border-2 aspect-square flex flex-col items-center justify-center text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
                    style={{ backgroundImage: `url(${preview})` }}
                >
                    {preview === "" ? (
                        <>
                            <PhotoIcon className="w-20" />
                            <div className="text-neutral-400 text-sm">
                                사진을 추가해주세요.
                                <p className="text-red-500">{state?.fieldErrors.photo}</p>
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
                    value={formValues.title}
                    onChange={(event) =>
                        setFormValues((prev) => ({
                            ...prev,
                            title: event.target.value,
                        }))
                    }
                    errors={state?.fieldErrors.title}
                />
                <InputContent
                    placeholder="설명"
                    required
                    name="description"
                    value={formValues.description}
                    onChange={(event) =>
                        setFormValues((prev) => ({
                            ...prev,
                            description: event.target.value,
                        }))
                    }
                    errors={state?.fieldErrors.description}
                    rowsNum={5}
                />
                <Input
                    type="number"
                    placeholder="가격"
                    required
                    name="price"
                    value={formValues.price}
                    onChange={(event) =>
                        setFormValues((prev) => ({
                            ...prev,
                            price: event.target.value,
                        }))
                    }
                    errors={state?.fieldErrors.price}
                    leadingIcon={<BanknotesIcon className="size-4" />}
                />

                <div className="flex flex-col gap-2 mt-2">
                    <span className="text-sm text-neutral-500">거래 방식</span>
                    <div className="flex gap-3">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="isMeetup"
                                className="size-4"
                                checked={formValues.isMeetup}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        isMeetup: event.target.checked,
                                    }))
                                }
                            />
                            직거래
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="isDelivery"
                                className="size-4"
                                checked={formValues.isDelivery}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        isDelivery: event.target.checked,
                                    }))
                                }
                            />
                            택배
                        </label>
                    </div>
                    {state?.fieldErrors?.dealType?.map((error: string, idx: number) => (
                        <span key={idx} className="text-red-500 text-sm">
                            {error}
                        </span>
                    ))}
                </div>

                <div className="mt-2">
                    <ProductLocationPicker />
                </div>
                {state?.fieldErrors?.latitude?.map((error: string, idx: number) => (
                    <span key={idx} className="text-red-500 text-sm">
                        {error}
                    </span>
                ))}
                {state?.fieldErrors?.longitude?.map((error: string, idx: number) => (
                    <span key={idx} className="text-red-500 text-sm">
                        {error}
                    </span>
                ))}

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
