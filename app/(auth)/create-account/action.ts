"use server";

import db from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { logIn } from "@/lib/session";

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
                "알파벳과 숫자, 특수문자를 포함해 8자 이상이어야 합니다.",
            ),
        confirm_password: z.string().trim().min(1, "필수 입력 항목입니다."),
    })
    .superRefine(async ({ username }, ctx) => {
        //인수(data, context(에러 객체))
        const user = await db.user.findUnique({
            where: {
                username,
            },
            select: {
                id: true,
            },
        });
        if (user) {
            ctx.addIssue({
                code: "custom",
                message: "이미 존재하는 닉네임입니다.",
                path: ["username"],
                fatal: true, //fatal:true로 하고 z.Never 반환하면 superRefine 이후의 다른 refine은 실행 X
            });
            return z.NEVER;
        }
    })
    .superRefine(async ({ email }, ctx) => {
        const user = await db.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
            },
        });
        if (user) {
            ctx.addIssue({
                code: "custom",
                message: "이미 존재하는 이메일입니다.",
                path: ["email"],
                fatal: true,
            });
            return z.NEVER;
        }
    })
    .refine(checkPasswords, {
        message: "두 비밀번호가 일치하지 않습니다.",
        path: ["confirm_password"],
    });

export async function createAccount(prevState: any, formData: FormData) {
    const data = {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirm_password: formData.get("confirm_password"),
    };
    const result = await formSchema.safeParseAsync(data); // await, Async: checkUniqueUsername, checkUniqueEmail가 async이기 때문에 필요
    if (!result.success) {
        return result.error.flatten();
    } else {
        const hashedPassword = await bcrypt.hash(result.data.password, 12);
        const user = await db.user.create({
            data: {
                username: result.data.username,
                email: result.data.email,
                password: hashedPassword,
                //사진 업로드 로직 대신 임시처리
                avatar: "https://blocks.astratic.com/img/user-img-small.png",
            },
            select: {
                id: true,
            },
        });
        await logIn(user.id);
        redirect("/posts");
    }
}
