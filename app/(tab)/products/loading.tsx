import { ProductRowSkeleton, Skeleton } from "@/components/skeleton";

export default function Loading() {
    return (
        <div className="p-5 pt-3 pb-20">
            <div className="space-y-2">
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="mt-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <ProductRowSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
