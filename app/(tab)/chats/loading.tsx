import { ChatRowSkeleton, Skeleton } from "@/components/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-col p-5 pt-3 pb-20">
            <Skeleton className="h-11 w-full rounded-xl" />
            <div className="mt-5 flex flex-col divide-y divide-neutral-100">
                {Array.from({ length: 6 }).map((_, i) => (
                    <ChatRowSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
