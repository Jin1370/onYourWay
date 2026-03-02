"use client";

import Link from "next/link";

export default function Profile() {
    return (
        <div className="flex flex-col p-5 pb-20 gap-3">
            <Link href="/profile/add-affiliated-univ" className="primary-btn">
                해외 소속 대학 등록하기
            </Link>
            <Link href="/profile/add-univ-interest" className="primary-btn">
                관심대학 추가하기
            </Link>
        </div>
    );
}
