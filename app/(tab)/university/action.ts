"use server";

import db from "@/lib/db";

interface CreateUniversityInput {
    name: string;
    country: string;
    domain: string;
    website: string;
}

export async function getUniversityDetails(input: CreateUniversityInput) {
    const { name, country, domain, website } = input;

    // 1️⃣ 먼저 DB에서 찾기 (domain 우선)
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

    // 2️⃣ Google API 호출
    const apiKey = process.env.GOOGLE_API_KEY;

    try {
        //findPlace api 호출
        const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
            `${name} ${country}`,
        )}&inputtype=textquery&fields=place_id&key=${apiKey}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData.candidates?.[0]) return null;
        const placeId = searchData.candidates[0].place_id;

        //place details api 호출
        const detailFields =
            "geometry,rating,reviews,name,formatted_address,photos";
        const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${detailFields}&key=${apiKey}`;
        const detailRes = await fetch(detailUrl);
        const detailData = await detailRes.json();
        const result = detailData.result;

        if (!result) return null;

        // 3️⃣ DB 저장
        const created = await db.university.create({
            data: {
                name,
                website,
                country,
                domain,
                placeId,
                lat: result.geometry?.location.lat,
                lng: result.geometry?.location.lng,
                address: result.formatted_address,
                googleRating: result.rating,
                photoReference: result.photos?.[0]?.photo_reference,
                googleReviews: result.reviews ?? [],
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
        return null;
    }
}
