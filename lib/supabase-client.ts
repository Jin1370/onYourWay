"use client";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xvhlzzgnlvjssyftujvh.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_J-MWCPiI_DmRYAchyzYo8Q_5xxPYQP7";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
    if (!client) {
        client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
    }
    return client;
}
