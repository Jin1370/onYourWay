"use client";

import { useEffect, useState } from "react";
import { getUniversityDetails, saveUnivInterest } from "./action";
import Link from "next/link";

interface UniversityModalProps {
    univName: string;
    country: string;
    domain: string;
    website: string;
    onClose: () => void;
}

interface UniversityFromDB {
    id: number;
    name: string;
    country?: string | null;
    lat?: number | null;
    lng?: number | null;
    address?: string | null;
    googleRating?: number | null;
    photoUrl?: string | null;
}

export default function UniversityModal({
    univName,
    country,
    domain,
    website,
    onClose,
}: UniversityModalProps) {
    const [data, setData] = useState<UniversityFromDB | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDetails() {
            const result = await getUniversityDetails({
                name: univName,
                country,
                domain,
                website,
            });

            setData(result);
            setLoading(false);
        }

        fetchDetails();
    }, [univName, country]);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white w-150 max-h-[80vh] overflow-y-auto rounded-xl p-6 m-5 relative">
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                >
                    ✕
                </button>

                {loading && <p>Loading...</p>}
                {!loading && !data && <p>대학교 정보를 찾을 수 없습니다.</p>}
                {!loading && data && (
                    <>
                        <h2 className="text-xl font-bold mb-2">{data.name}</h2>

                        <p className="text-sm text-gray-500 mb-3">
                            {data.address}
                        </p>

                        {data.photoUrl && (
                            <img
                                src={data.photoUrl}
                                alt={data.name}
                                className="w-full aspect-video object-cover rounded-lg mb-4"
                            />
                        )}

                        {data.lat && data.lng && (
                            <iframe
                                className="w-full aspect-video rounded-lg mb-4"
                                loading="lazy"
                                src={`https://www.google.com/maps?q=${data.lat},${data.lng}&z=15&output=embed`}
                            />
                        )}

                        {website && (
                            <div className="mb-4">
                                <a
                                    href={website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-myblue hover:text-blue-800 text-sm"
                                >
                                    🌐 공식 웹사이트 이동 &gt; {website}
                                </a>
                            </div>
                        )}
                        <form
                            action={saveUnivInterest.bind(null, data.id)}
                            className="primary-btn"
                        >
                            <button>관심 학교 추가</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
