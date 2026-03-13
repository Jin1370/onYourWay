"use server";

import db from "@/lib/db";
import { getApproxLocationLabel } from "@/lib/location-label";
import { parseProductPhotos, stringifyProductPhotos } from "@/lib/product-photos";
import getSession from "@/lib/session";
import fs from "fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

const formSchema = z
    .object({
        photos: z.array(z.string()).min(1, "사진을 1장 이상 업로드해주세요."),
        title: z.string().trim().min(1, "상품명을 입력해주세요."),
        description: z.string().trim().min(1, "설명을 입력해주세요."),
        price: z.coerce.number().min(1, "가격을 입력해주세요."),
        latitude: z.coerce.number().min(-90).max(90),
        longitude: z.coerce.number().min(-180).max(180),
        locationLabel: z.string().trim().optional().default(""),
        isMeetup: z.boolean().optional().default(false),
        isDelivery: z.boolean().optional().default(false),
        dealType: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (!data.isMeetup && !data.isDelivery) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "직거래/택배 중 하나 이상 선택해주세요.",
                path: ["dealType"],
            });
        }
    });

function buildDefaultFieldErrors() {
    return {
        photos: [] as string[],
        title: [] as string[],
        description: [] as string[],
        price: [] as string[],
        latitude: [] as string[],
        longitude: [] as string[],
        locationLabel: [] as string[],
        isMeetup: [] as string[],
        isDelivery: [] as string[],
        dealType: [] as string[],
    };
}

function extractValues(formData: FormData) {
    return {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        price: String(formData.get("price") ?? ""),
        isMeetup: formData.get("isMeetup") === "on",
        isDelivery: formData.get("isDelivery") === "on",
    };
}

const allowedImageTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);
const extMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
};

export async function updateProduct(
    productId: number,
    _prevState: unknown,
    formData: FormData,
) {
    const values = extractValues(formData);
    try {
        const session = await getSession();
        if (!session.id) {
            return {
                fieldErrors: buildDefaultFieldErrors(),
                formErrors: ["로그인이 필요합니다."],
                values,
            };
        }

        const rawPhotos = formData
            .getAll("photos")
            .filter((item): item is File => item instanceof File && item.size > 0);
        const prevPhotos = parseProductPhotos(String(formData.get("prevPhotos") ?? ""));
        const data = {
            photos: [...prevPhotos] as string[],
            title: formData.get("title"),
            description: formData.get("description"),
            price: formData.get("price"),
            latitude: formData.get("latitude"),
            longitude: formData.get("longitude"),
            locationLabel: formData.get("locationLabel"),
            isMeetup: formData.get("isMeetup") === "on",
            isDelivery: formData.get("isDelivery") === "on",
            dealType: "",
        };

        const existingProduct = await db.product.findUnique({
            where: {
                id: productId,
            },
            select: {
                userId: true,
                latitude: true,
                longitude: true,
                locationLabel: true,
            },
        });
        if (!existingProduct || existingProduct.userId !== session.id) {
            return {
                fieldErrors: buildDefaultFieldErrors(),
                formErrors: ["수정 권한이 없습니다."],
                values,
            };
        }

        await fs.mkdir("./public/uploads/products", { recursive: true });
        for (const rawPhoto of rawPhotos) {
            if (!allowedImageTypes.has(rawPhoto.type)) {
                return {
                    fieldErrors: buildDefaultFieldErrors(),
                    formErrors: [
                        "이미지는 jpg, png, webp, gif 형식만 가능합니다.",
                    ],
                    values,
                };
            }
            if (rawPhoto.size > 8 * 1024 * 1024) {
                return {
                    fieldErrors: buildDefaultFieldErrors(),
                    formErrors: ["각 이미지는 8MB 이하만 가능합니다."],
                    values,
                };
            }
            const ext = extMap[rawPhoto.type] ?? ".jpg";
            const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
            const photoData = await rawPhoto.arrayBuffer();
            await fs.writeFile(
                `./public/uploads/products/${safeName}`,
                Buffer.from(photoData),
            );
            data.photos.push(`/uploads/products/${safeName}`);
        }

        const parsed = formSchema.safeParse(data);
        if (!parsed.success) {
            return {
                ...parsed.error.flatten(),
                values,
            };
        }

        const isSameLocation =
            existingProduct.latitude === parsed.data.latitude &&
            existingProduct.longitude === parsed.data.longitude;

        const nextLocationLabel = isSameLocation
            ? existingProduct.locationLabel || parsed.data.locationLabel || null
            : (await getApproxLocationLabel(
                  parsed.data.latitude,
                  parsed.data.longitude,
              )) ||
              parsed.data.locationLabel ||
              null;

        const product = await db.product.update({
            where: {
                id: productId,
            },
            data: {
                title: parsed.data.title,
                description: parsed.data.description,
                price: parsed.data.price,
                photo: stringifyProductPhotos(parsed.data.photos),
                isMeetup: parsed.data.isMeetup,
                isDelivery: parsed.data.isDelivery,
                latitude: parsed.data.latitude,
                longitude: parsed.data.longitude,
                locationLabel: nextLocationLabel,
            },
        });

        revalidatePath("/products");
        redirect(`/products/${product.id}`);
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error("updateProduct failed:", error);
        const message =
            error instanceof Error
                ? `수정 중 오류: ${error.message}`
                : "수정 중 오류가 발생했습니다. 다시 시도해주세요.";
        return {
            fieldErrors: buildDefaultFieldErrors(),
            formErrors: [message],
            values,
        };
    }
}
