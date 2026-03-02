"use server";

import db from "@/lib/db";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import fs from "fs/promises";

export async function createProduct(prevState: any, formData: FormData) {
    let productId: number | null = null;
    try {
        const formSchema = z.object({
            photo: z.string().min(1, "필수 입력 항목입니다."),
            title: z.string().trim().min(1, "필수 입력 항목입니다."),
            description: z.string().trim().min(1, "필수 입력 항목입니다."),
            price: z.coerce.number().min(1, "필수 입력 항목입니다."),
        });
        const data = {
            photo: formData.get("photo"),
            title: formData.get("title"),
            description: formData.get("description"),
            price: formData.get("price"),
        };
        if (data.photo instanceof File && data.photo.size > 0) {
            const photoData = await data.photo.arrayBuffer(); //File 객체 안에 담긴 이진 데이터를 ArrayBuffer 형식으로 읽어옴
            await fs.writeFile(
                //실제로 파일을 서버 컴퓨터의 특정 경로에 생성하고 내용을 기록
                `./public/${data.photo.name}`,
                Buffer.from(photoData),
            );
            data.photo = `/${data.photo.name}`;
            //data.photo = "https://blocks.astratic.com/img/general-img-portrait.png";
        } else {
            data.photo = "";
        }
        const result = formSchema.safeParse(data);
        if (!result.success) {
            return result.error.flatten();
        } else {
            const session = await getSession();
            const product = await db.product.create({
                data: {
                    userId: session.id!,
                    title: result.data.title,
                    description: result.data.description,
                    price: result.data.price,
                    photo: result.data.photo,
                },
            });
            revalidatePath("/products");
            productId = product.id;
        }
    } catch (error) {
        console.error("createProduct failed:", error);
        return {
            fieldErrors: {
                photo: [] as string[],
                title: [] as string[],
                description: [] as string[],
                price: [] as string[],
            },
            formErrors: [
                "등록 중 오류가 발생했습니다. 입력값을 확인하고 다시 시도해주세요.",
            ],
        };
    }

    if (productId) {
        redirect(`/products/${productId}`);
    }
}
