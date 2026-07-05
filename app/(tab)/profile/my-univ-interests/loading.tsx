import { Skeleton } from "@/components/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-col gap-3 p-5 pb-20">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
        </div>
    );
}
