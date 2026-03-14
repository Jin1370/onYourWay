import ListSearchForm from "@/components/list-search-form";
import db from "@/lib/db";
import { parseProductPhotos } from "@/lib/product-photos";
import getSession from "@/lib/session";
import { formatToTimeAgo, formatToWon } from "@/lib/utils";
import { HeartIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import ProductFilters from "./product-filters";
import PurchaseLocationSetup from "./purchase-location-setup";

type ProductFilter = {
    meetup: boolean;
    delivery: boolean;
    radiusKm: number;
    latitude: number;
    longitude: number;
};

async function getProducts(filter: ProductFilter, keyword?: string) {
    let where:
        | {
              isMeetup?: boolean;
              isDelivery?: boolean;
              OR?: Array<{
                  isMeetup?: boolean;
                  isDelivery?: boolean;
                  title?: { contains: string };
                  description?: { contains: string };
              }>;
              AND?: Array<object>;
          }
        | undefined;

    if (filter.meetup && filter.delivery) {
        where = {
            OR: [{ isMeetup: true }, { isDelivery: true }],
        };
    } else if (filter.meetup) {
        where = { isMeetup: true };
    } else if (filter.delivery) {
        where = { isDelivery: true };
    }

    if (keyword) {
        const searchWhere = {
            OR: [
                { title: { contains: keyword } },
                { description: { contains: keyword } },
            ],
        };
        where = where ? { AND: [where, searchWhere] } : searchWhere;
    }

    const products = await db.product.findMany({
        where,
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
            latitude: true,
            longitude: true,
            created_at: true,
            _count: {
                select: {
                    wishes: true,
                },
            },
        },
    });

    if (filter.radiusKm > 0) {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const earthRadiusKm = 6371;
        const filtered = products.filter((product) => {
            if (
                typeof product.latitude !== "number" ||
                typeof product.longitude !== "number"
            ) {
                return false;
            }
            const dLat = toRad(product.latitude - filter.latitude);
            const dLng = toRad(product.longitude - filter.longitude);
            const lat1 = toRad(filter.latitude);
            const lat2 = toRad(product.latitude);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) *
                    Math.cos(lat2) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = earthRadiusKm * c;
            return distance <= filter.radiusKm;
        });
        return filtered;
    }

    return products;
}

export default async function Products({
    searchParams,
}: {
    searchParams?:
        | { meetup?: string; delivery?: string; radius?: string; q?: string }
        | Promise<{
              meetup?: string;
              delivery?: string;
              radius?: string;
              q?: string;
          }>;
}) {
    const session = await getSession();
    if (!session.id) {
        redirect("/login");
    }

    const user = await db.user.findUnique({
        where: {
            id: session.id,
        },
        select: {
            latitude: true,
            longitude: true,
        },
    });

    const latitude = user?.latitude;
    const longitude = user?.longitude;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
        return (
            <div className="p-5 pb-20">
                <div className="rounded-xl border border-red-50 bg-red-50 p-4 text-sm text-red-500">
                    구매 위치를 설정해야 상품을 볼 수 있습니다.
                </div>
                <PurchaseLocationSetup />
            </div>
        );
    }

    const resolved =
        searchParams &&
        typeof (searchParams as Promise<unknown>).then === "function"
            ? await searchParams
            : (searchParams as
                  | {
                        meetup?: string;
                        delivery?: string;
                        radius?: string;
                        q?: string;
                    }
                  | undefined);

    const filter = {
        meetup: resolved?.meetup === "1",
        delivery: resolved?.delivery === "1",
        radiusKm: Number(resolved?.radius ?? "0") || 0,
        latitude,
        longitude,
    };
    const keyword = resolved?.q?.trim() ?? "";

    const products = await getProducts(filter, keyword);

    return (
        <div className="p-5 pt-3 pb-20">
            <div className="space-y-2">
                <ListSearchForm
                    action="/products"
                    placeholder="상품 검색"
                    defaultValue={keyword}
                    hiddenParams={[
                        ...(filter.meetup
                            ? [{ name: "meetup", value: "1" }]
                            : []),
                        ...(filter.delivery
                            ? [{ name: "delivery", value: "1" }]
                            : []),
                        ...(filter.radiusKm > 0
                            ? [
                                  {
                                      name: "radius",
                                      value: String(filter.radiusKm),
                                  },
                              ]
                            : []),
                    ]}
                />
                <ProductFilters
                    defaultLatitude={latitude}
                    defaultLongitude={longitude}
                />
            </div>

            <div className="mt-5">
                {products.length === 0 ? (
                    <p className="pt-3 text-center text-sm text-neutral-500">
                        상품이 존재하지 않습니다.
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
                                            <span>조회 {product.views}</span>
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

            <div className="fixed bottom-20 left-1/2 w-full max-w-screen-sm -translate-x-1/2 px-6 pointer-events-none">
                <Link
                    href="/products/create"
                    className="ml-auto size-15 rounded-full bg-myblue text-white shadow-lg flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:bg-myblue/90 pointer-events-auto"
                >
                    <PlusIcon className="size-7 stroke-[2.5]" />
                </Link>
            </div>
        </div>
    );
}
