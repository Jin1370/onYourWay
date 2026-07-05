"use client";

import { createClient } from "@supabase/supabase-js";

// 값은 .env의 NEXT_PUBLIC_* 에서 주입됨(빌드 타임에 인라인).
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
    if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY) {
        throw new Error(
            "Supabase 환경변수가 없습니다. .env에 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 설정하세요.",
        );
    }
    if (!client) {
        client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
    }
    return client;
}
