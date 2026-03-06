interface AddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

interface GeocodeResult {
    address_components: AddressComponent[];
}

interface GeocodeResponse {
    results: GeocodeResult[];
    status: string;
}

function pickAddressPart(
    components: AddressComponent[],
    candidates: string[],
): string | null {
    for (const type of candidates) {
        const found = components.find((component) =>
            component.types.includes(type),
        );
        if (found?.long_name) return found.long_name;
    }
    return null;
}

export async function getApproxLocationLabel(
    latitude: number,
    longitude: number,
): Promise<string | null> {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return null;

    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=ko&key=${apiKey}`;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) return null;

        const data = (await response.json()) as GeocodeResponse;
        if (data.status !== "OK" || !data.results.length) return null;

        const components = data.results[0].address_components;
        const country = pickAddressPart(components, ["country"]);
        const city = pickAddressPart(components, [
            "locality",
            "administrative_area_level_1",
        ]);
        const district = pickAddressPart(components, [
            "sublocality_level_1",
            "sublocality",
            "administrative_area_level_2",
        ]);
        const neighborhood = pickAddressPart(components, [
            "sublocality_level_2",
            "administrative_area_level_3",
            "neighborhood",
        ]);

        const label = [country, city, district ?? neighborhood]
            .filter(Boolean)
            .join(" ");

        return label || null;
    } catch {
        return null;
    }
}

