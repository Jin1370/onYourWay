import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. Google Fonts 설정
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// 2. Local Font (Pretendard) 설정
const pretendard = localFont({
    src: "../fonts/pretendard/PretendardVariable.woff2",
    display: "swap",
    weight: "45 920",
    variable: "--font-pretendard",
});

export const metadata: Metadata = {
    title: {
        template: "%s | OnYourWay",
        default: "On Your Way",
    },
    description: "A Place for Students Abroad",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body
                className={`${pretendard.className} ${pretendard.variable} ${geistSans.variable} ${geistMono.variable} antialiased max-w-screen-sm mx-auto`}
            >
                {children}
            </body>
        </html>
    );
}
