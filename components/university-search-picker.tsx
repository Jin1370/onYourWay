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
    placeholder = "대학 영문 이름을 입력하세요 (ex.Oxford)",
    renderModal,
}: UniversitySearchPickerProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<University[]>([]);
    const [selected, setSelected] = useState<University | null>(null);

    useEffect(() => {
        if (query.length < 2) {
            return;
        }
        const timer = setTimeout(async () => {
            const data = await fetch(
                `http://universities.hipolabs.com/search?name=${query}`,
            ).then((res) => res.json());

            setResults(data.slice(0, 10));
        }, 500);
        return () => clearTimeout(timer);
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
                    {(query.length < 2 ? [] : results).map((univ, idx) => (
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
            {selected &&
                renderModal({
                    univName: selected.name,
                    country: selected.country,
                    domain: selected.domains[0],
                    website: selected.web_pages[0],
                    onClose: () => setSelected(null),
                })}
        </div>
    );
}
