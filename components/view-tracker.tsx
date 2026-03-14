"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type ViewType = "post" | "product";

interface ViewTrackerProps {
    type: ViewType;
    id: number;
}

export default function ViewTracker({ type, id }: ViewTrackerProps) {
    const router = useRouter();
    const sentRef = useRef(false);

    useEffect(() => {
        if (!Number.isFinite(id)) return;
        if (typeof window === "undefined") return;
        if (sentRef.current) return;
        sentRef.current = true;

        void fetch(`/api/${type}s/${id}/view`, {
            method: "POST",
        }).then((response) => {
            if (response.ok) {
                router.refresh();
            }
        });
    }, [id, router, type]);

    return null;
}
