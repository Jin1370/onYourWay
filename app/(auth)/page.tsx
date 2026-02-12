import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center min-h-screen p-6">
            <div className="my-auto flex flex-col items-center gap-5">
                <span className="text-9xl">🧳</span>
                <h1 className="text-4xl font-light text-transparent bg-clip-text bg-linear-to-r from-sky-500 via-blue-500 to-purple-500">
                    On Your Way
                </h1>
            </div>
            <div className="flex flex-col items-center gap-3 w-full">
                <Link href="/create-account" className="primary-btn text-lg">
                    시작하기
                </Link>
                <div className="flex gap-2">
                    <span>이미 계정이 있나요?</span>
                    <Link href="/login" className="hover:underline">
                        로그인
                    </Link>
                </div>
            </div>
        </div>
    );
}
