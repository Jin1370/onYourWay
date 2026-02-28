import Link from "next/link";

export default function Profile() {
    return (
        <div className="flex flex-col p-5 pb-20">
            <Link href="/profile/add-univ-interest" className="primary-btn">
                관심 대학 추가하기
            </Link>
        </div>
    );
}
