"use client";

import Input from "@/components/input";
import { useEffect, useState } from "react";

interface University {
    name: string;
    country: string;
    domains: string[];
    web_pages: string[];
}

interface UniversitySearchPickerProps {
    placeholder?: string;
    renderModal: (props: {
        univName: string;
        country: string;
        domain: string;
        website: string;
        onClose: () => void;
    }) => React.ReactNode;
}

export default function UniversitySearchPicker({
    placeholder = "대학 이름을 입력하세요 (ex. Oxford)",
    renderModal,
}: UniversitySearchPickerProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<University[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selected, setSelected] = useState<University | null>(null);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `/api/universities/search?q=${encodeURIComponent(query)}`,
                    {
                        signal: controller.signal,
                    },
                );
                if (!res.ok) {
                    setResults([]);
                    return;
                }
                const data = (await res.json()) as
                    | { results?: University[] }
                    | University[];
                const nextResults = Array.isArray(data)
                    ? data
                    : (data.results ?? []);
                setResults(nextResults.slice(0, 10));
            } catch (error) {
                if ((error as Error).name === "AbortError") return;
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    return (
        <div className="flex flex-col p-5 pb-20">
            <div className="p-4">
                <Input
                    name="queryUniv"
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <ul className="mt-2">
                    {query.length >= 2 && results.length === 0 && !isLoading ? (
                        <li className="p-2 text-sm text-neutral-400">
                            검색 결과가 없습니다.
                        </li>
                    ) : null}
                    {isLoading ? (
                        <li className="p-2 text-sm text-neutral-400">
                            검색 중...
                        </li>
                    ) : null}
                    {(query.length < 2 ? [] : results).map((univ, idx) => (
                        <li
                            key={`${univ.name}-${univ.country}-${idx}`}
                            className="p-2 hover:bg-gray-200 cursor-pointer even:bg-gray-100 text-sm"
                            onClick={() => setSelected(univ)}
                        >
                            {univ.name}
                            <p className="text-mygray">{univ.country}</p>
                        </li>
                    ))}
                </ul>
            </div>
            {selected &&
                renderModal({
                    univName: selected.name,
                    country: selected.country,
                    domain: selected.domains[0] ?? "",
                    website: selected.web_pages[0] ?? "",
                    onClose: () => setSelected(null),
                })}
        </div>
    );
}
