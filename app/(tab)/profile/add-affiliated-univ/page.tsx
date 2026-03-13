"use client";

import UniversitySearchPicker from "@/components/university-search-picker";
import { useSearchParams } from "next/navigation";
import UniversityModal from "./university-modal";

export default function AddAffiliatedUniv() {
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") ?? "/profile";

    return (
        <UniversitySearchPicker
            renderModal={(props) => (
                <UniversityModal
                    univName={props.univName}
                    country={props.country}
                    domain={props.domain}
                    website={props.website}
                    returnTo={returnTo}
                    onClose={props.onClose}
                />
            )}
        />
    );
}
