"use client";

import UniversitySearchPicker from "@/components/university-search-picker";
import { useSearchParams } from "next/navigation";
import UniversityModal from "./university-modal";

export default function AddForeignAffiliatedUniv() {
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") ?? "/profile";
    const typeParam = searchParams.get("type");
    const type: "foreign" | "domestic" =
        typeParam === "domestic" ? "domestic" : "foreign";

    return (
        <UniversitySearchPicker
            renderModal={(props) => (
                <UniversityModal
                    univName={props.univName}
                    country={props.country}
                    domain={props.domain}
                    website={props.website}
                    returnTo={returnTo}
                    type={type}
                    onClose={props.onClose}
                />
            )}
        />
    );
}
