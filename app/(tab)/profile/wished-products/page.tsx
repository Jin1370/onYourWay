import db from "@/lib/db";
import { parseProductPhotos } from "@/lib/product-photos";
import getSession from "@/lib/session";
import { formatToTimeAgo, formatToWon } from "@/lib/utils";
import { EyeIcon, HeartIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function WishedProductsPage() {
    const session = await getSession();
    if (!session.id) {
        redirect("/login");
    }

    const products = await db.product.findMany({
        where: {
            wishes: {
                some: {
                    userId: session.id,
                },
            },
        },
        orderBy: {
            created_at: "desc",
        },
        select: {
            id: true,
            title: true,
            views: true,
            price: true,
            photo: true,
            isMeetup: true,
            isDelivery: true,
            created_at: true,
            _count: {
                select: {
                    wishes: true,
                },
            },
        },
    });

    return (
        <div className="p-5 pb-20">
            {products.length === 0 ? (
                <p className="text-center text-sm text-neutral-500">
                    찜한 상품이 없습니다.
                </p>
            ) : (
                products.map((product) => {
                    const thumbnail =
                        parseProductPhotos(product.photo)[0] ??
                        "https://blocks.astratic.com/img/user-img-small.png";

                    return (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="mb-5 flex gap-5 border-b border-neutral-200 pb-5 text-neutral-400 last:border-b-0 last:pb-0"
                        >
                            <div className="relative size-28 overflow-hidden rounded-md">
                                <Image
                                    src={thumbnail}
                                    alt={product.title}
                                    className="object-cover"
                                    fill
                                />
                            </div>
                            <div className="flex flex-1 flex-col gap-2">
                                <h2 className="text-lg font-semibold text-neutral-700">
                                    {product.title}
                                </h2>
                                <div className="flex gap-1">
                                    {product.isMeetup ? (
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
                                            직거래
                                        </span>
                                    ) : null}
                                    {product.isDelivery ? (
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">
                                            택배
                                        </span>
                                    ) : null}
                                </div>
                                <h2 className="text-neutral-700">
                                    {formatToWon(product.price)}
                                </h2>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                        <span>
                                            {formatToTimeAgo(
                                                product.created_at.toString(),
                                            )}
                                        </span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                            <EyeIcon className="size-4" />
                                            {product.views}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-myblue">
                                        <HeartIcon className="size-4" />
                                        {product._count.wishes}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })
            )}
        </div>
    );
}
