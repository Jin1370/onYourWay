import { NextResponse } from "next/server";

interface UniversityResult {
    name: string;
    country: string;
    domains: string[];
    web_pages: string[];
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();

    if (q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
            `https://universities.hipolabs.com/search?name=${encodeURIComponent(q)}`,
            {
                signal: controller.signal,
                cache: "no-store",
            },
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
            return NextResponse.json({ results: [] }, { status: 200 });
        }

        const data = (await response.json()) as UniversityResult[];
        return NextResponse.json({ results: data.slice(0, 10) });
    } catch {
        return NextResponse.json({ results: [] }, { status: 200 });
    }
}
