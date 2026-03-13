"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import PurchaseLocationSetup from "./purchase-location-setup";

const distanceOptions = [
    { label: "2km", value: 2 },
    { label: "5km", value: 5 },
    { label: "10km", value: 10 },
    { label: "20km", value: 20 },
    { label: "무제한", value: 0 },
];

export default function ProductFilters({
    defaultLatitude,
    defaultLongitude,
}: {
    defaultLatitude: number;
    defaultLongitude: number;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    const current = useMemo(() => {
        return {
            meetup: searchParams.get("meetup") === "1",
            delivery: searchParams.get("delivery") === "1",
            radius: Number(searchParams.get("radius") ?? "0") || 0,
        };
    }, [searchParams]);

    const updateFilter = useCallback(
        (next: { meetup: boolean; delivery: boolean; radius: number }) => {
            const params = new URLSearchParams(searchParams.toString());
            if (next.meetup) params.set("meetup", "1");
            else params.delete("meetup");
            if (next.delivery) params.set("delivery", "1");
            else params.delete("delivery");
            if (next.radius > 0) params.set("radius", String(next.radius));
            else params.delete("radius");

            const query = params.toString();
            router.replace(query ? `/products?${query}` : "/products");
        },
        [router, searchParams],
    );

    return (
        <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm">
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-neutral-700">
                    <input
                        type="checkbox"
                        checked={current.meetup}
                        onChange={(event) =>
                            updateFilter({
                                meetup: event.target.checked,
                                delivery: current.delivery,
                                radius: current.radius,
                            })
                        }
                        className="size-4 accent-myblue"
                    />
                    직거래
                </label>
                <label className="flex items-center gap-2 text-neutral-700">
                    <input
                        type="checkbox"
                        checked={current.delivery}
                        onChange={(event) =>
                            updateFilter({
                                meetup: current.meetup,
                                delivery: event.target.checked,
                                radius: current.radius,
                            })
                        }
                        className="size-4 accent-myblue"
                    />
                    택배
                </label>
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="ml-auto text-neutral-500"
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "거리 접기" : "거리 펼치기"}
                >
                    {isOpen ? (
                        <ChevronUpIcon className="size-4" />
                    ) : (
                        <ChevronDownIcon className="size-4" />
                    )}
                </button>
            </div>
            {isOpen ? (
                <div className="mt-2 flex w-full flex-col border-t border-neutral-200 pt-3">
                    <span className="my-1 text-base font-semibold text-neutral-800">
                        위치 기반 필터
                    </span>
                    <div className="px-2.5">
                        <div className="relative">
                            <div
                                className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between"
                                style={{ paddingInline: "4px" }}
                            >
                                <span className="size-2 rounded-full bg-indigo-300" />
                                <span className="size-2 rounded-full bg-indigo-300" />
                                <span className="size-2 rounded-full bg-indigo-300" />
                                <span className="size-2 rounded-full bg-indigo-300" />
                                <span className="size-2 rounded-full bg-indigo-300" />
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={25}
                                value={
                                    Math.max(
                                        0,
                                        distanceOptions.findIndex(
                                            (opt) =>
                                                opt.value === current.radius,
                                        ),
                                    ) * 25
                                }
                                onChange={(event) => {
                                    const idx = Math.min(
                                        distanceOptions.length - 1,
                                        Math.max(
                                            0,
                                            Math.round(
                                                Number(event.target.value) / 25,
                                            ),
                                        ),
                                    );
                                    const nextRadius =
                                        distanceOptions[idx]?.value ?? 0;
                                    updateFilter({
                                        meetup: current.meetup,
                                        delivery: current.delivery,
                                        radius: nextRadius,
                                    });
                                }}
                                className="range range-xs w-full text-myblue"
                            />
                        </div>
                    </div>
                    <div className="mt-1.5 flex justify-between px-2.5 text-xs">
                        <span>2km</span>
                        <span>5km</span>
                        <span>10km</span>
                        <span>20km</span>
                        <span>무제한</span>
                    </div>
                    <PurchaseLocationSetup
                        compact
                        defaultLatitude={defaultLatitude}
                        defaultLongitude={defaultLongitude}
                    />
                </div>
            ) : null}
        </div>
    );
}
