"use server";

import bcrypt from "bcrypt";
import db from "@/lib/db";
import { sendEmailVerificationForUser } from "@/lib/email-verification";
import { redirect } from "next/navigation";
import { z } from "zod";

const checkPasswords = ({
    password,
    confirm_password,
}: {
    password: string;
    confirm_password: string;
}) => password === confirm_password;

const formSchema = z
    .object({
        username: z.string().trim().min(1, "필수 입력 항목입니다."),
        email: z
            .string()
            .trim()
            .toLowerCase()
            .min(1, "필수 입력 항목입니다.")
            .pipe(z.string().email("올바른 이메일 형식이 아닙니다.")),
        password: z
            .string()
            .trim()
            .regex(
                /^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
                "영문, 숫자, 특수문자를 포함한 8자 이상 입력해주세요.",
            ),
        confirm_password: z.string().trim().min(1, "필수 입력 항목입니다."),
    })
    .superRefine(async ({ username }, ctx) => {
        const user = await db.user.findUnique({
            where: { username },
            select: { id: true },
        });

        if (user) {
            ctx.addIssue({
                code: "custom",
                message: "이미 사용 중인 닉네임입니다.",
                path: ["username"],
                fatal: true,
            });
            return z.NEVER;
        }
    })
    .superRefine(async ({ email }, ctx) => {
        const user = await db.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (user) {
            ctx.addIssue({
                code: "custom",
                message: "이미 사용 중인 이메일입니다.",
                path: ["email"],
                fatal: true,
            });
            return z.NEVER;
        }
    })
    .refine(checkPasswords, {
        message: "비밀번호가 일치하지 않습니다.",
        path: ["confirm_password"],
    });

function extractValues(formData: FormData) {
    return {
        username: String(formData.get("username") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        confirm_password: String(formData.get("confirm_password") ?? ""),
    };
}

export async function createAccount(_prevState: unknown, formData: FormData) {
    const values = extractValues(formData);

    const result = await formSchema.safeParseAsync(values);
    if (!result.success) {
        return {
            ...result.error.flatten(),
            values,
        };
    }

    const hashedPassword = await bcrypt.hash(result.data.password, 12);
    const user = await db.user.create({
        data: {
            username: result.data.username,
            email: result.data.email,
            password: hashedPassword,
            avatar: "https://blocks.astratic.com/img/user-img-small.png",
        },
        select: {
            id: true,
            email: true,
        },
    });

    const sent = await sendEmailVerificationForUser(user.id, user.email ?? "");

    redirect(
        `/verify-email?email=${encodeURIComponent(user.email ?? "")}&sent=${sent.ok ? "1" : "0"}`,
    );
}
