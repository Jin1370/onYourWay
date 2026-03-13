"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import Link from "next/link";
import { useActionState, useState } from "react";
import { login } from "./action";

type LoginFormState = {
    fieldErrors?: {
        email?: string[];
        password?: string[];
    };
    formErrors?: string[];
    values?: {
        email?: string;
        password?: string;
    };
} | null;

function GoogleIcon() {
    return (
        <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="size-5"
            aria-hidden="true"
        >
            <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
            <path fill="none" d="M0 0h48v48H0z" />
        </svg>
    );
}

export default function LogIn() {
    const [state, trigger] = useActionState<LoginFormState, FormData>(login, null);
    const [formValues, setFormValues] = useState({
        email: "",
        password: "",
    });

    return (
        <div className="flex min-h-screen flex-col gap-4 px-16 py-20 text-base">
            <h1>로그인 정보를 입력해주세요.</h1>
            <form action={trigger} noValidate className="flex flex-col gap-3">
                <Input
                    type="text"
                    placeholder="이메일"
                    required
                    name="email"
                    value={formValues.email}
                    onChange={(event) =>
                        setFormValues((prev) => ({
                            ...prev,
                            email: event.target.value,
                        }))
                    }
                    errors={state?.fieldErrors?.email}
                />
                <Input
                    type="password"
                    placeholder="비밀번호"
                    required
                    name="password"
                    value={formValues.password}
                    onChange={(event) =>
                        setFormValues((prev) => ({
                            ...prev,
                            password: event.target.value,
                        }))
                    }
                    errors={state?.fieldErrors?.password}
                />
                <Button text="로그인" />
            </form>
            <Link
                href="/api/auth/google/start?next=%2Fposts"
                className="my-5 inline-flex items-center justify-center gap-2 rounded-full border border-[#747775] bg-white px-4 py-2.5 text-sm font-medium tracking-[0.25px] text-[#1f1f1f] shadow-[0_1px_2px_0_rgba(60,64,67,0.30),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:bg-neutral-50"
            >
                <GoogleIcon />
                <span>Google 계정으로 로그인</span>
            </Link>
        </div>
    );
}
