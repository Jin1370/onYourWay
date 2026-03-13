import { verifyEmailToken } from "@/lib/email-verification";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.redirect(new URL("/verify-email?status=invalid", request.url));
    }

    const result = await verifyEmailToken(token);
    if (result === "VERIFIED") {
        return NextResponse.redirect(new URL("/verify-email/success", request.url));
    }

    if (result === "EXPIRED") {
        return NextResponse.redirect(new URL("/verify-email?status=expired", request.url));
    }

    if (result === "ALREADY_USED") {
        return NextResponse.redirect(new URL("/verify-email?status=used", request.url));
    }

    return NextResponse.redirect(new URL("/verify-email?status=invalid", request.url));
}
