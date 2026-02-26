interface StarRatingProps {
    rating: number | null;
    showNumber?: boolean;
    size?: "sm" | "md" | "lg";
}

export default function StarRating({
    rating,
    showNumber = true,
    size = "sm",
}: StarRatingProps) {
    const starSize =
        size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4";

    if (rating === null || rating === undefined) {
        return (
            <div className="flex items-center gap-2 text-gray-400">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className={`mask mask-star-2 bg-gray-300 ${starSize}`}
                        />
                    ))}
                </div>
                {showNumber && <span className="text-sm">No rating</span>}
            </div>
        );
    }

    const safeRating = Math.max(0, Math.min(5, rating));

    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                    const fillPercent = Math.min(
                        100,
                        Math.max(0, (safeRating - (star - 1)) * 100),
                    );

                    return (
                        <div key={star} className={`relative ${starSize}`}>
                            {/* 회색 배경 */}
                            <div className="mask mask-star-2 bg-gray-300 w-full h-full absolute" />
                            {/* 노란색 채움 */}
                            <div
                                className="mask mask-star-2 bg-yellow-400 w-full h-full absolute"
                                style={{
                                    clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {showNumber && (
                <span className="text-sm text-gray-600">
                    {safeRating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
