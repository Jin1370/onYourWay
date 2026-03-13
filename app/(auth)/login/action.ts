"use server";

import bcrypt from "bcrypt";
import db from "@/lib/db";
import { logIn } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

const checkEmailExists = async (email: string) => {
    const user = await db.user.findUnique({
        where: { email },
        select: { id: true },
    });
    return Boolean(user);
};

const formSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, "필수 입력 항목입니다.")
        .pipe(z.string().email("올바른 이메일 형식이 아닙니다."))
        .refine(checkEmailExists, "이메일 또는 비밀번호가 올바르지 않습니다."),
    password: z
        .string()
        .trim()
        .regex(
            /^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
            "영문, 숫자, 특수문자를 포함한 8자 이상 입력해주세요.",
        ),
});

function extractValues(formData: FormData) {
    return {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
    };
}

export async function login(_prevState: unknown, formData: FormData) {
    const values = extractValues(formData);

    const result = await formSchema.safeParseAsync(values);
    if (!result.success) {
        return {
            ...result.error.flatten(),
            values,
        };
    }

    const user = await db.user.findUnique({
        where: {
            email: result.data.email,
        },
        select: {
            id: true,
            password: true,
            email: true,
            emailVerifiedAt: true,
        },
    });

    const same = await bcrypt.compare(result.data.password, user?.password ?? "xxxx");
    if (!same) {
        return {
            fieldErrors: {
                password: ["이메일 또는 비밀번호가 올바르지 않습니다."],
                email: [],
            },
            formErrors: [],
            values,
        };
    }

    if (!user?.emailVerifiedAt) {
        redirect(`/verify-email?email=${encodeURIComponent(user?.email ?? "")}`);
    }

    await logIn(user.id);
    redirect("/posts");
}
