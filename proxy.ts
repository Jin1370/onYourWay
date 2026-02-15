import { NextRequest, NextResponse } from "next/server";
import getSession from "@/lib/session";

interface Routes {
    [key: string]: boolean;
}

//array보다 object가 탐색 빠름
const publicOnlyUrls: Routes = {
    "/": true,
    "/login": true,
    //"/sms": true,
    "/create-account": true,
    //"/github/start": true,
    //"/github/complete": true,
};

//미들웨어는 edge runtime(node.js API의 경량 버전)에 실행-> 많은 것을 할 수는 없음
export async function proxy(request: NextRequest) {
    //함수명 반드시 proxy
    const session = await getSession();
    const exists = publicOnlyUrls[request.nextUrl.pathname];
    if (!session.id) {
        if (!exists) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    } else {
        if (exists) {
            return NextResponse.redirect(new URL("/posts", request.url));
        }
    }
}

// 미들웨어가 실행될 경로 지정
export const config = {
    matcher: [
        /*
         * 아래로 시작하는 경로를 제외:
         * - api (API 라우트)
         * - _next/static (정적 파일)
         * - _next/image (이미지 최적화 API)
         * - favicon.ico (파비콘)
         * - 모든 이미지 확장자 (public 폴더 내 파일들)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
