import db from "@/lib/db";
import { notFound } from "next/navigation";
import EditProductForm from "./edit-product-form";

export default async function EditProduct({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: strId } = await params;
    const productId = Number(strId);
    if (isNaN(productId)) return notFound();

    const product = await db.products.findUnique({
        where: {
            id: productId,
        },
        select: {
            id: true,
            photo: true,
            title: true,
            description: true,
            price: true,
        },
    });
    if (!product) return notFound();
    return <EditProductForm product={product} />;
}
