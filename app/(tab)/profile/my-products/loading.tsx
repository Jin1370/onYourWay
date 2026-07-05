import { ProductRowSkeleton } from "@/components/skeleton";

export default function Loading() {
    return (
        <div className="p-5 pb-20">
            {Array.from({ length: 5 }).map((_, i) => (
                <ProductRowSkeleton key={i} />
            ))}
        </div>
    );
}
