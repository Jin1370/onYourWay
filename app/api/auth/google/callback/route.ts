import db from "@/lib/db";
import getSession, { logIn } from "@/lib/session";
import { NextResponse } from "next/server";

type GoogleTokenResponse = {
    access_token?: string;
    error?: string;
};

type GoogleUserInfo = {
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
};

function getBaseUrl(request: Request) {
    return (
        process.env.APP_BASE_URL ??
        process.env.NEXT_PUBLIC_APP_URL ??
        new URL(request.url).origin
    );
}

function sanitizeUsername(raw: string) {
    const normalized = raw
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
    return normalized || "user";
}

async function getUniqueUsername(baseRaw: string) {
    const base = sanitizeUsername(baseRaw);
    let candidate = base;
    let suffix = 1;

    while (true) {
        const exists = await db.user.findUnique({
            where: { username: candidate },
            select: { id: true },
        });
        if (!exists) {
            return candidate;
        }
        suffix += 1;
        candidate = `${base}_${suffix}`;
    }
}

export async function GET(request: Request) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        return NextResponse.redirect(
            new URL("/login?social=google_config_missing", request.url),
        );
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");

    const session = await getSession();
    const expectedState = session.oauthState;
    const nextPath =
        session.oauthNext && session.oauthNext.startsWith("/")
            ? session.oauthNext
            : "/posts";
    session.oauthState = undefined;
    session.oauthNext = undefined;
    await session.save();

    if (oauthError) {
        return NextResponse.redirect(new URL("/login?social=google_cancelled", request.url));
    }

    if (!code || !state || !expectedState || state !== expectedState) {
        return NextResponse.redirect(new URL("/login?social=google_state_invalid", request.url));
    }

    const redirectUri = `${getBaseUrl(request)}/api/auth/google/callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        }),
        cache: "no-store",
    });

    if (!tokenResponse.ok) {
        return NextResponse.redirect(new URL("/login?social=google_token_failed", request.url));
    }

    const tokenJson = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenJson.access_token || tokenJson.error) {
        return NextResponse.redirect(new URL("/login?social=google_token_failed", request.url));
    }

    const userInfoResponse = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        {
            headers: {
                Authorization: `Bearer ${tokenJson.access_token}`,
            },
            cache: "no-store",
        },
    );
    if (!userInfoResponse.ok) {
        return NextResponse.redirect(
            new URL("/login?social=google_profile_failed", request.url),
        );
    }

    const profile = (await userInfoResponse.json()) as GoogleUserInfo;
    const email = profile.email?.trim().toLowerCase();
    if (!email || profile.email_verified === false) {
        return NextResponse.redirect(new URL("/login?social=google_email_invalid", request.url));
    }

    const existing = await db.user.findUnique({
        where: { email },
        select: {
            id: true,
            emailVerifiedAt: true,
            avatar: true,
        },
    });

    let userId: number;
    if (existing) {
        const updated = await db.user.update({
            where: { id: existing.id },
            data: {
                emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
                avatar: existing.avatar ?? profile.picture ?? undefined,
            },
            select: { id: true },
        });
        userId = updated.id;
    } else {
        const usernameBase = profile.name || email.split("@")[0] || "user";
        const username = await getUniqueUsername(usernameBase);
        const created = await db.user.create({
            data: {
                username,
                email,
                emailVerifiedAt: new Date(),
                avatar:
                    profile.picture ??
                    "https://blocks.astratic.com/img/user-img-small.png",
            },
            select: { id: true },
        });
        userId = created.id;
    }

    await logIn(userId);
    return NextResponse.redirect(new URL(nextPath, request.url));
}
