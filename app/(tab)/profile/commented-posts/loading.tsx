import { PostCardSkeleton } from "@/components/skeleton";

export default function Loading() {
    return (
        <div className="flex flex-col p-5 pb-20">
            {Array.from({ length: 4 }).map((_, i) => (
                <PostCardSkeleton key={i} />
            ))}
        </div>
    );
}
