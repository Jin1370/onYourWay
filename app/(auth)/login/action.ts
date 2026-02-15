"use server";

import db from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { logIn } from "@/lib/session";

const checkEmailExists = async (email: string) => {
    const user = await db.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
        },
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
        .refine(checkEmailExists, "이메일 또는 비밀번호가 일치하지 않습니다."),
    password: z
        .string()
        .trim()
        .regex(
            /^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
            "알파벳과 숫자, 특수문자를 포함해 8자 이상이어야 합니다.",
        ),
});

export async function login(prevState: any, formData: FormData) {
    const data = {
        email: formData.get("email"),
        password: formData.get("password"),
    };

    const result = await formSchema.safeParseAsync(data);
    if (!result.success) {
        return result.error.flatten();
    } else {
        const user = await db.user.findUnique({
            where: {
                email: result.data.email,
            },
            select: {
                id: true,
                password: true,
            },
        });
        const same = await bcrypt.compare(
            result.data.password,
            user!.password ?? "xxxx",
        );
        if (same) {
            await logIn(user!.id);
            redirect("/posts");
        } else {
            return {
                fieldErrors: {
                    password: ["이메일 또는 비밀번호가 일치하지 않습니다."],
                    email: [],
                },
            };
        }
    }
}
