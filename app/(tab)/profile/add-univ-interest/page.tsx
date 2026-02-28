"use client";

import Input from "@/components/input";
import { useEffect, useState } from "react";
import UniversityModal from "./university-modal";

interface University {
    name: string;
    country: string;
    domains: string[];
    web_pages: string[];
}

export default function AddUnivInterest() {
    const [query, setQuery] = useState(""); // 입력값
    const [results, setResults] = useState<University[]>([]); // 검색 결과
    const [selected, setSelected] = useState<University | null>(null);

    //사용자가 글자를 입력하면 0.5초 타이머 대기 후 api 호출
    //디바운싱: 짧은 시간 동안 여러 번 발생하는 이벤트 중 마지막 이벤트만 한 번 실행하여 성능 향상
    useEffect(() => {
        if (query.length < 2) {
            // 2글자 이상일 때만 검색
            setResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            const data = await fetch(
                `http://universities.hipolabs.com/search?name=${query}`,
            ).then((res) => res.json());

            setResults(data.slice(0, 10)); // 상위 10개만 표시
        }, 500);
        //0.5초가 지나기 전에 글자를 입력하면 기존 타이머 취소
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="flex flex-col p-5 pb-20">
            <div className="p-4">
                <Input
                    name="queryUniv"
                    type="text"
                    placeholder="대학 영문 이름을 입력하세요 (ex.Oxford)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <ul className="mt-2">
                    {results.map((univ, idx) => (
                        <li
                            key={idx}
                            className="p-2 hover:bg-gray-200 cursor-pointer even:bg-gray-100 text-sm"
                            onClick={() => setSelected(univ)}
                        >
                            {univ.name}
                            <p className="text-mygray">{univ.country}</p>
                        </li>
                    ))}
                </ul>
            </div>
            {selected && (
                <UniversityModal
                    univName={selected.name}
                    country={selected.country}
                    domain={selected.domains[0]}
                    website={selected.web_pages[0]}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}
