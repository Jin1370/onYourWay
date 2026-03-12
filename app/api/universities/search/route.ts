import { NextResponse } from "next/server";
import db from "@/lib/db";

interface UniversityResult {
    name: string;
    country: string;
    domains: string[];
    web_pages: string[];
}

const UPSTREAM_ENDPOINTS = [
    "https://universities.hipolabs.com/search",
    "http://universities.hipolabs.com/search",
];

async function fetchFromUpstream(q: string): Promise<UniversityResult[] | null> {
    for (const endpoint of UPSTREAM_ENDPOINTS) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        try {
            const response = await fetch(
                `${endpoint}?name=${encodeURIComponent(q)}`,
                {
                    signal: controller.signal,
                    cache: "no-store",
                },
            );

            if (!response.ok) {
                // Upstream 장애는 폴백으로 흡수하므로 서버 로그 노이즈를 피한다.
                continue;
            }

            const data = (await response.json()) as UniversityResult[];
            return data.slice(0, 10).map((item) => ({
                name: item.name ?? "",
                country: item.country ?? "",
                domains: Array.isArray(item.domains) ? item.domains : [],
                web_pages: Array.isArray(item.web_pages) ? item.web_pages : [],
            }));
        } catch {
            // 네트워크/타임아웃 예외는 폴백 처리.
        } finally {
            clearTimeout(timeoutId);
        }
    }

    return null;
}

async function fetchFromDb(q: string): Promise<UniversityResult[]> {
    const rows = await db.university.findMany({
        where: {
            OR: [
                { name: { contains: q } },
                { country: { contains: q } },
                { domain: { contains: q } },
            ],
        },
        select: {
            name: true,
            country: true,
            domain: true,
            website: true,
        },
        orderBy: {
            name: "asc",
        },
        take: 10,
    });

    return rows.map((row) => ({
        name: row.name,
        country: row.country ?? "",
        domains: row.domain ? [row.domain] : [],
        web_pages: row.website ? [row.website] : [],
    }));
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();

    if (q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const upstreamResults = await fetchFromUpstream(q);
    if (upstreamResults && upstreamResults.length > 0) {
        return NextResponse.json({ results: upstreamResults });
    }

    try {
        const dbResults = await fetchFromDb(q);
        return NextResponse.json({
            results: dbResults,
            source: "db_fallback",
            error: upstreamResults ? undefined : "UPSTREAM_EXCEPTION",
        });
    } catch (error) {
        console.error("University search db fallback exception", error);
        return NextResponse.json(
            { results: [], error: "SEARCH_UNAVAILABLE" },
            { status: 200 },
        );
    }
}
