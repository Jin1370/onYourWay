"use client";

import UniversitySearchPicker from "@/components/university-search-picker";
import UniversityModal from "./university-modal";

export default function AddAffiliatedUniv() {
    return (
        <UniversitySearchPicker
            renderModal={(props) => (
                <UniversityModal
                    univName={props.univName}
                    country={props.country}
                    domain={props.domain}
                    website={props.website}
                    onClose={props.onClose}
                />
            )}
        />
    );
}
