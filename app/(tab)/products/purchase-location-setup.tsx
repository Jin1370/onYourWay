"use client";

import Button from "@/components/button";
import ProductLocationPicker from "@/components/product-location-picker";
import { useActionState } from "react";
import { saveBuyerLocation } from "./action";

interface PurchaseLocationSetupProps {
    defaultLatitude?: number | null;
    defaultLongitude?: number | null;
    compact?: boolean;
}

export default function PurchaseLocationSetup({
    defaultLatitude,
    defaultLongitude,
    compact = false,
}: PurchaseLocationSetupProps) {
    const [state, action] = useActionState(saveBuyerLocation, null);

    return (
        <div
            className={
                compact
                    ? "mt-3 border-t border-neutral-200 pt-3"
                    : "mt-4 rounded-xl border border-neutral-200 bg-white p-4"
            }
        >
            <h2 className="text-base font-semibold text-neutral-800">
                {compact ? "구매 위치 변경" : "구매 위치 설정"}
            </h2>
            <form
                action={action}
                className="mt-3 flex flex-col gap-3"
                noValidate
            >
                <ProductLocationPicker
                    defaultLatitude={defaultLatitude}
                    defaultLongitude={defaultLongitude}
                />

                {state?.fieldErrors?.latitude?.map(
                    (error: string, index: number) => (
                        <span key={index} className="text-sm text-red-500">
                            {error}
                        </span>
                    ),
                )}
                {state?.fieldErrors?.longitude?.map(
                    (error: string, index: number) => (
                        <span key={index} className="text-sm text-red-500">
                            {error}
                        </span>
                    ),
                )}
                {state?.formErrors?.map((error: string, index: number) => (
                    <span key={index} className="text-sm text-red-500">
                        {error}
                    </span>
                ))}

                <Button text={compact ? "구매 위치 저장" : "저장"} />
            </form>
        </div>
    );
}
