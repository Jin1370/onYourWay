import db from "@/lib/db";
import { formatToTimeAgo, formatToWon } from "@/lib/utils";
import { HeartIcon } from "@heroicons/react/24/outline";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

async function getProducts() {
    const products = await db.product.findMany({
        select: {
            id: true,
            title: true,
            views: true,
            price: true,
            photo: true,
            created_at: true,
            _count: {
                select: {
                    wishes: true,
                },
            },
        },
    });
    return products;
}

export default async function Products() {
    const products = await getProducts();
    return (
        <div className="p-5 pb-20">
            {products.map((product) => (
                <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="pb-5 mb-5 border-b border-neutral-300 text-neutral-400 flex gap-5 last:pb-0 last:border-b-0"
                >
                    <div className="relative size-28 overflow-hidden rounded-md">
                        <Image
                            src={`${product.photo}`}
                            alt={`${product.title}`}
                            className="object-cover"
                            fill
                        />
                    </div>
                    <div className="flex flex-col flex-1 gap-2">
                        <h2 className="text-neutral-700 font-semibold text-lg">
                            {product.title}
                        </h2>
                        <h2 className="text-neutral-700">
                            {formatToWon(product.price)}
                        </h2>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex gap-4 items-center">
                                <span>
                                    {formatToTimeAgo(
                                        product.created_at.toString(),
                                    )}
                                </span>
                                <span>•</span>
                                <span>조회 {product.views}</span>
                            </div>
                            <div className="flex gap-1 items-center text-myblue">
                                <HeartIcon className="size-4" />
                                {product._count.wishes}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
            <Link
                href="/products/create"
                className="fixed bottom-20 right-10 size-15 text-myblue hover:text-myblue/80 transition-colors"
            >
                <PlusCircleIcon />
            </Link>
        </div>
    );
}
