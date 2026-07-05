"use client";

import { useEffect, useRef } from "react";

type ViewType = "post" | "product";

interface ViewTrackerProps {
    type: ViewType;
    id: number;
}

export default function ViewTracker({ type, id }: ViewTrackerProps) {
    const sentRef = useRef(false);

    useEffect(() => {
        if (!Number.isFinite(id)) return;
        if (typeof window === "undefined") return;
        if (sentRef.current) return;
        sentRef.current = true;

        // 조회수는 서버에 기록만 하고 페이지를 새로고침하지 않는다.
        // (router.refresh()를 호출하면 게시글/상품을 열 때마다 전체 페이지가 다시 로드됨.
        //  본인의 방금 조회분은 다음 진입 시 자연스럽게 반영됨.)
        void fetch(`/api/${type}s/${id}/view`, { method: "POST" });
    }, [id, type]);

    return null;
}
