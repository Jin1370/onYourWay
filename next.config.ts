import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                /*NextJS의 <Image/>는 이미지를 자동으로 최적화 -> 성능 향상
                하지만 외부 호스트의 이미지(다른 사이트의 이미지 링크 등)를 불러올 때는 보안 상의 이유로 허용 X -> hostname 등록 필요*/
                //hostname: "avatars.githubusercontent.com",
                hostname: "**",
            },
        ],
    },
};

export default nextConfig;
