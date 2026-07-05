import { Skeleton } from "@/components/skeleton";

export default function Loading() {
    return (
        <div className="p-5 pb-30">
            <div className="mb-2 flex items-center gap-2">
                <Skeleton className="size-7 rounded-full" />
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-32" />
                </div>
            </div>
            <Skeleton className="mt-4 mb-2 h-6 w-3/4" />
            <div className="mb-10 flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="mt-2 h-56 w-full rounded-xl" />
            </div>
            <Skeleton className="h-9 w-20 rounded-full" />
        </div>
    );
}
