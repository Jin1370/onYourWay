"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import InputContent from "@/components/input-content";
import { parseProductPhotos } from "@/lib/product-photos";
import ProductLocationPicker from "@/components/product-location-picker";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useActionState, useEffect, useState } from "react";
import { updateProduct } from "./action";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2000;
const WEBP_QUALITY = 0.86;

interface ProductFormState {
    values?: {
        title?: string;
        description?: string;
        price?: string;
        isMeetup?: boolean;
        isDelivery?: boolean;
    };
}

export default function EditProductForm({
    product,
}: {
    product: {
        id: number;
        photo: string;
        title: string;
        description: string;
        price: number;
        isMeetup: boolean;
        isDelivery: boolean;
        latitude: number | null;
        longitude: number | null;
    };
}) {
    const initialPhotos = parseProductPhotos(product.photo);
    const [previews, setPreviews] = useState<string[]>(initialPhotos);
    const [state, trigger] = useActionState(
        updateProduct.bind(null, product.id),
        null,
    );
    const [formValues, setFormValues] = useState({
        title: product.title,
        description: product.description,
        price: String(product.price),
        isMeetup: product.isMeetup,
        isDelivery: product.isDelivery,
    });

    useEffect(() => {
        const submitted = (state as ProductFormState | null)?.values;
        if (!submitted) return;
        setFormValues({
            title: submitted.title ?? "",
            description: submitted.description ?? "",
            price: submitted.price ?? "",
            isMeetup: Boolean(submitted.isMeetup),
            isDelivery: Boolean(submitted.isDelivery),
        });
    }, [state]);

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
                image.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
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
            if (blob.size >= file.size && file.size <= MAX_UPLOAD_BYTES) return file;

            const baseName = file.name.replace(/\.[^.]+$/, "");
            return new File([blob], `${baseName}.webp`, {
                type: "image/webp",
                lastModified: Date.now(),
            });
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    };

    const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length === 0) return;

        const optimizedFiles: File[] = [];
        const nextPreviews: string[] = [];
        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                alert("이미지 파일만 업로드해주세요.");
                return;
            }
            const optimized = await optimizeImageForUpload(file);
            if (optimized.size > MAX_UPLOAD_BYTES) {
                alert("각 이미지는 8MB 이하만 업로드할 수 있습니다.");
                return;
            }
            optimizedFiles.push(optimized);
            nextPreviews.push(URL.createObjectURL(optimized));
        }

        const transfer = new DataTransfer();
        optimizedFiles.forEach((file) => transfer.items.add(file));
        event.target.files = transfer.files;
        setPreviews(nextPreviews);
    };

    return (
        <div className="flex flex-col text-base min-h-screen py-10 px-8 gap-4">
            <h1 className="text-lg font-semibold">상품 수정</h1>
            <form action={trigger} noValidate className="flex flex-col gap-3">
                <label
                    htmlFor="photos"
                    className="border-2 aspect-square flex flex-col items-center justify-center text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
                    style={
                        previews.length > 0
                            ? { backgroundImage: `url(${previews[0]})` }
                            : undefined
                    }
                >
                    {previews.length === 0 ? (
                        <>
                            <PhotoIcon className="w-20" />
                            <div className="text-neutral-400 text-sm">
                                사진을 추가해주세요. (여러 장 가능)
                                <p className="text-red-500">
                                    {state?.fieldErrors.photos}
                                </p>
                            </div>
                        </>
                    ) : null}
                </label>
                {previews.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                        {previews.map((src, index) => (
                            <div
                                key={`${src}-${index}`}
                                className="aspect-square rounded-md bg-center bg-cover border border-neutral-200"
                                style={{ backgroundImage: `url(${src})` }}
                            />
                        ))}
                    </div>
                ) : null}
                <input
                    onChange={onImageChange}
                    type="file"
                    id="photos"
                    name="photos"
                    multiple
                    className="hidden"
                />
                <input
                    type="hidden"
                    name="prevPhotos"
                    value={JSON.stringify(initialPhotos)}
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
                                checked={formValues.isMeetup}
                                className="size-4"
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
                                checked={formValues.isDelivery}
                                className="size-4"
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
                    <ProductLocationPicker
                        defaultLatitude={product.latitude}
                        defaultLongitude={product.longitude}
                    />
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
                <Button text="수정 저장" />
            </form>
        </div>
    );
}
