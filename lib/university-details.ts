import db from "@/lib/db";

export interface CreateUniversityInput {
    name: string;
    country: string;
    domain: string;
    website: string;
}

export async function getUniversityDetails(input: CreateUniversityInput) {
    const { name, country, domain, website } = input;

    if (domain) {
        const existing = await db.university.findUnique({
            where: { domain },
        });

        if (existing) {
            return {
                ...existing,
                photoUrl: existing.photoReference
                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${existing.photoReference}&key=${process.env.GOOGLE_API_KEY}`
                    : null,
            };
        }
    }

    const existingByName = await db.university.findUnique({
        where: { name },
    });
    if (existingByName) {
        return {
            ...existingByName,
            photoUrl: existingByName.photoReference
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${existingByName.photoReference}&key=${process.env.GOOGLE_API_KEY}`
                : null,
        };
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return await createFallbackUniversity({ name, country, domain, website });
    }

    try {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
            `${name} ${country}`,
        )}&inputtype=textquery&fields=place_id&key=${apiKey}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData.candidates?.[0]) {
            return await createFallbackUniversity({ name, country, domain, website });
        }
        const placeId = searchData.candidates[0].place_id;

        const detailFields = "geometry,name,formatted_address,photos";
        const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${detailFields}&key=${apiKey}`;
        const detailRes = await fetch(detailUrl);
        const detailData = await detailRes.json();
        const result = detailData.result;

        if (!result) {
            return await createFallbackUniversity({ name, country, domain, website });
        }

        const created = await db.university.create({
            data: {
                name,
                website: website || null,
                country: country || null,
                domain: domain || null,
                placeId,
                lat: result.geometry?.location.lat,
                lng: result.geometry?.location.lng,
                address: result.formatted_address,
                photoReference: result.photos?.[0]?.photo_reference,
            },
        });
        return {
            ...created,
            photoUrl: created.photoReference
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${created.photoReference}&key=${apiKey}`
                : null,
        };
    } catch (error) {
        console.error("Google API Error:", error);
        return await createFallbackUniversity({ name, country, domain, website });
    }
}

async function createFallbackUniversity(input: CreateUniversityInput) {
    const { name, country, domain, website } = input;

    const existing = await db.university.findUnique({
        where: { name },
    });
    if (existing) {
        return {
            ...existing,
            photoUrl: existing.photoReference
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${existing.photoReference}&key=${process.env.GOOGLE_API_KEY}`
                : null,
        };
    }

    const base = (domain || name)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .slice(0, 64);
    const placeId = `manual:${base}`;

    const created = await db.university.create({
        data: {
            name,
            website: website || null,
            country: country || null,
            domain: domain || null,
            placeId,
        },
    });

    return {
        ...created,
        photoUrl: null,
    };
}
