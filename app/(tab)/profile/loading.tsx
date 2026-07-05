import { Skeleton } from "@/components/skeleton";

function MenuGroupSkeleton({ rows }: { rows: number }) {
    return (
        <div className="text-md mb-3">
            <Skeleton className="mb-2 h-4 w-20" />
            <div className="flex flex-col gap-2">
                {Array.from({ length: rows }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
            </div>
        </div>
    );
}

export default function Loading() {
    return (
        <div className="flex flex-col gap-4 p-5 pt-3 pb-20">
            <div className="mb-5 flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <Skeleton className="size-15 rounded-full" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-3 w-44" />
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-40" />
                </div>
            </div>
            <MenuGroupSkeleton rows={3} />
            <MenuGroupSkeleton rows={2} />
            <MenuGroupSkeleton rows={1} />
        </div>
    );
}
