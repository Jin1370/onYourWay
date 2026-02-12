"use client";

import Button from "@/components/button";
import Input from "@/components/input";
//import SocialLogin from "@/components/social-login";
//import { createAccount } from "./action";
import { useActionState } from "react";
//import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

export default function CreateAccount() {
    //const [state, trigger] = useActionState(createAccount, null);
    return (
        <div className="flex flex-col text-base min-h-screen py-20 px-16 gap-4">
            <h1>정보를 입력해주세요.</h1>
            <form className="flex flex-col gap-3">
                <Input
                    type="text"
                    placeholder="닉네임"
                    required
                    name="username"
                    //errors={state?.fieldErrors.username}
                />
                <Input
                    type="text"
                    placeholder="이메일"
                    required
                    name="email"
                    //errors={state?.fieldErrors.email}
                />
                <Input
                    type="password"
                    placeholder="비밀번호"
                    required
                    name="password"
                    //errors={state?.fieldErrors.password}
                    //minLength={PASSWORD_MIN_LENGTH}
                />
                <Input
                    type="password"
                    placeholder="비밀번호 재입력"
                    required
                    name="confirm_password"
                    // errors={state?.fieldErrors.confirm_password}
                    // minLength={PASSWORD_MIN_LENGTH}
                />
                <Button text="회원가입" />
            </form>
            {/* <SocialLogin /> */}
        </div>
    );
}
