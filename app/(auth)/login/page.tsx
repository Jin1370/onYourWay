"use client";

import Button from "@/components/button";
import Input from "@/components/input";
//import SocialLogin from "@/components/social-login";
import { useActionState } from "react";
import { login } from "./action";

export default function LogIn() {
    const [state, trigger] = useActionState(login, null);
    return (
        <div className="flex flex-col text-base min-h-screen py-20 px-16 gap-4">
            <h1>정보를 입력해주세요.</h1>
            <form action={trigger} noValidate className="flex flex-col gap-3">
                <Input
                    type="text"
                    placeholder="이메일"
                    required
                    name="email"
                    errors={state?.fieldErrors.email}
                />
                <Input
                    type="password"
                    placeholder="비밀번호"
                    required
                    name="password"
                    errors={state?.fieldErrors.password}
                />
                <Button text="회원가입" />
            </form>
            {/* <SocialLogin /> */}
        </div>
    );
}
