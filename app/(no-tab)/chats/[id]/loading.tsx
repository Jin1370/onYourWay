import { Skeleton } from "@/components/skeleton";

export default function Loading() {
    return (
        <div className="flex h-screen flex-col">
            <div className="flex items-center gap-3 border-b border-neutral-200 p-4">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div
                        key={i}
                        className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                    >
                        <Skeleton
                            className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-44" : "w-32"}`}
                        />
                    </div>
                ))}
            </div>
            <div className="border-t border-neutral-200 p-4">
                <Skeleton className="h-11 w-full rounded-full" />
            </div>
        </div>
    );
}
