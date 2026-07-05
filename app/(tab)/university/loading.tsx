import { Skeleton } from "@/components/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-col gap-4 p-5 pt-3 pb-20">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-5 w-24" />
            <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
            </div>
        </div>
    );
}
