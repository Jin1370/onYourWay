import getSession from "@/lib/session";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

function getBaseUrl(request: Request) {
    return (
        process.env.APP_BASE_URL ??
        process.env.NEXT_PUBLIC_APP_URL ??
        new URL(request.url).origin
    );
}

export async function GET(request: Request) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        return NextResponse.redirect(
            new URL("/login?social=google_config_missing", request.url),
        );
    }

    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const nextPath = searchParams.get("next") || "/posts";

    const state = randomBytes(24).toString("hex");
    session.oauthState = state;
    session.oauthNext = nextPath.startsWith("/") ? nextPath : "/posts";
    await session.save();

    const baseUrl = getBaseUrl(request);
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state,
        prompt: "select_account",
    });

    return NextResponse.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    );
}
