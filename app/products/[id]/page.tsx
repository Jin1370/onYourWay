import LikeButton from "@/components/like-button";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToTimeAgo, formatToWon } from "@/lib/utils";
import { EyeIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import DeleteBtn from "@/components/delete-button";
import WishButton from "@/components/wish-button";

async function getProduct(productId: number) {
    const product = await db.products.update({
        where: {
            id: productId,
        },
        data: {
            views: {
                increment: 1,
            },
        },
        include: {
            user: {
                select: {
                    username: true,
                    avatar: true,
                },
            },
            _count: {
                select: {
                    wishes: true,
                },
            },
        },
    });
    return product;
}

async function getIsWished(productId: number, userId: number) {
    const isWished = await db.wishes.findUnique({
        where: {
            id: {
                productId,
                userId,
            },
        },
    });
    return Boolean(isWished);
}

export default async function Product({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: strId } = await params;
    const productId = Number(strId);
    if (isNaN(productId)) return notFound();

    const product = await getProduct(productId);
    if (!product) return notFound();

    const session = await getSession();
    const isWished = await getIsWished(productId, session.id!);

    async function deleteProduct() {
        "use server";
        await db.products.delete({
            where: {
                id: product.id,
            },
        });
        redirect("/products");
    }

    return (
        <div className="p-5 text-neutral-700 pb-30">
            <div className="flex items-center gap-2 mb-2">
                <Image
                    width={28}
                    height={28}
                    className="size-7 rounded-full"
                    src={product.user.avatar!}
                    alt={product.user.username}
                />
                <div>
                    <span className="text-sm font-semibold">
                        {product.user.username}
                    </span>
                    <div className="text-xs">
                        <span>
                            {formatToTimeAgo(product.created_at.toString())}
                        </span>
                    </div>
                </div>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden my-5">
                <Image
                    fill
                    src={product.photo}
                    className="object-cover"
                    alt={product.title}
                />
            </div>
            <h2 className="text-lg font-semibold my-1">{product.title}</h2>
            <p className="mb-10">{product.description}</p>
            <div className="flex flex-col gap-3 items-start">
                <div className="flex items-center gap-2 text-mygray text-sm">
                    <EyeIcon className="size-5" />
                    <span>조회 {product.views}</span>
                </div>
                <div className="flex gap-2">
                    <WishButton
                        isWished={isWished}
                        wishCount={product._count.wishes}
                        productId={productId}
                    />
                    {product.userId === session.id ? (
                        <div className="flex gap-2">
                            <Link
                                href={`/products/${product.id}/edit`}
                                className="text-sm border rounded-full p-2 w-14 bg-myblue text-white border-myblue hover:bg-myblue/80 transition-colors text-center"
                            >
                                수정
                            </Link>
                            <DeleteBtn onDelete={deleteProduct} />
                        </div>
                    ) : null}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-screen-sm flex items-center border-t border-neutral-300 bg-white p-5 text-lg">
                <div className="flex-7 font-bold ">
                    판매가 {formatToWon(product.price)}
                </div>
                <div className="flex-3">
                    <Link
                        href={`/products/${product.id}/chat`}
                        className="primary-btn"
                    >
                        채팅하기
                    </Link>
                </div>
            </div>
        </div>
    );
}
