// 페이지 전환 시 loading.tsx에서 사용하는 공용 스켈레톤 조각들.
// 실제 화면 레이아웃과 최대한 비슷한 형태로 맞춰 깜빡임 없이 자연스럽게 로딩되도록 함.

export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-md bg-neutral-200 ${className}`}
            aria-hidden="true"
        />
    );
}

// 포스트 목록 카드 한 개 (posts 목록 / 내가 쓴·좋아요·댓글 단 포스트와 동일 형태)
export function PostCardSkeleton() {
    return (
        <div className="mb-5 flex flex-col gap-2 border-b border-neutral-200 pb-5 last:border-b-0 last:pb-0">
            <div className="mb-1 flex items-center gap-2">
                <Skeleton className="size-7 rounded-full" />
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-32" />
                </div>
            </div>
            <Skeleton className="mb-1 aspect-video w-full rounded-xl" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="flex justify-end gap-4">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-10" />
            </div>
        </div>
    );
}

// 상품 목록 행 한 개 (products 목록 / 내 상품·찜한 상품과 동일 형태)
export function ProductRowSkeleton() {
    return (
        <div className="mb-5 flex gap-5 border-b border-neutral-200 pb-5 last:border-b-0 last:pb-0">
            <Skeleton className="size-28 shrink-0 rounded-md" />
            <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <div className="mt-auto flex items-center justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-8" />
                </div>
            </div>
        </div>
    );
}

// 채팅 목록 행 한 개
export function ChatRowSkeleton() {
    return (
        <div className="flex items-center gap-3 py-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-2.5 w-10" />
        </div>
    );
}
