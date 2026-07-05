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
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="mt-3 mb-1 h-6 w-2/3" />
            <div className="mb-10 flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
            <Skeleton className="h-9 w-24 rounded-full" />
        </div>
    );
}
