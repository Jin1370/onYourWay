export function parseProductPhotos(photo: string | null | undefined): string[] {
    if (!photo) return [];

    const trimmed = photo.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[")) {
        try {
            const parsed = JSON.parse(trimmed) as unknown;
            if (Array.isArray(parsed)) {
                return parsed.filter(
                    (item): item is string =>
                        typeof item === "string" && item.trim().length > 0,
                );
            }
        } catch {
            return [];
        }
    }

    return [trimmed];
}

export function stringifyProductPhotos(photos: string[]) {
    return JSON.stringify(photos);
}
