"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useState } from "react";

interface ProductPhotoCarouselProps {
    photos: string[];
    title: string;
}

export default function ProductPhotoCarousel({
    photos,
    title,
}: ProductPhotoCarouselProps) {
    const [index, setIndex] = useState(0);
    const hasMultiple = photos.length > 1;

    const movePrev = () => {
        setIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const moveNext = () => {
        setIndex((prev) => (prev + 1) % photos.length);
    };

    return (
        <div className="my-5">
            <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                    fill
                    src={photos[index]}
                    className="object-cover"
                    alt={`${title} ${index + 1}`}
                />

                {hasMultiple ? (
                    <>
                        <button
                            type="button"
                            onClick={movePrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-1.5 text-white hover:bg-black/50 transition"
                            aria-label="이전 사진"
                        >
                            <ChevronLeftIcon className="size-5" />
                        </button>
                        <button
                            type="button"
                            onClick={moveNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-1.5 text-white hover:bg-black/50 transition"
                            aria-label="다음 사진"
                        >
                            <ChevronRightIcon className="size-5" />
                        </button>
                    </>
                ) : null}
            </div>

            {hasMultiple ? (
                <div className="mt-3 flex items-center justify-center gap-1.5">
                    {photos.map((_, dotIndex) => (
                        <span
                            key={dotIndex}
                            className={`size-2 rounded-full ${
                                dotIndex === index
                                    ? "bg-neutral-700"
                                    : "bg-neutral-300"
                            }`}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
