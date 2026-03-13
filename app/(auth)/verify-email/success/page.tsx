import Link from "next/link";

export default function VerifyEmailSuccessPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h1 className="text-xl font-semibold">이메일 인증 완료</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    계정 인증이 완료되었습니다. 이제 로그인할 수 있습니다.
                </p>
                <Link href="/login" className="primary-btn mt-5 block text-center">
                    로그인하러 가기
                </Link>
            </div>
        </div>
    );
}
