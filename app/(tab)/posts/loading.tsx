import { PostCardSkeleton, Skeleton } from "@/components/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-col p-5 pt-3 pb-20">
            <div className="space-y-2">
                <Skeleton className="h-11 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="mt-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
