"use client";

import { useEffect, useRef } from "react";

type GoogleWindow = Window & {
    google?: {
        maps?: any;
    };
};

type LatLng = {
    lat: number;
    lng: number;
};

let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string) {
    if (typeof window === "undefined") return Promise.resolve();
    if ((window as GoogleWindow).google?.maps) return Promise.resolve();
    if (googleMapsPromise) return googleMapsPromise;

    googleMapsPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Maps"));
        document.head.appendChild(script);
    });

    return googleMapsPromise;
}

function hashString(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function moveByMeters(origin: LatLng, meters: number, bearingRad: number): LatLng {
    const earthRadius = 6378137;
    const dLat = (meters * Math.cos(bearingRad)) / earthRadius;
    const dLng =
        (meters * Math.sin(bearingRad)) /
        (earthRadius * Math.cos((origin.lat * Math.PI) / 180));

    return {
        lat: origin.lat + (dLat * 180) / Math.PI,
        lng: origin.lng + (dLng * 180) / Math.PI,
    };
}

function getObfuscatedCircleCenter(actual: LatLng, seed: string) {
    const hash = hashString(seed);
    const radius = 700;
    const minOffset = 180;
    const maxOffset = 420;
    const offset = minOffset + (hash % (maxOffset - minOffset + 1));
    const angle = ((hash % 360) * Math.PI) / 180;

    const center = moveByMeters(actual, offset, angle);
    return { center, radius };
}

export default function ProductApproxLocationMap({
    productId,
    latitude,
    longitude,
    locationLabel,
}: {
    productId: number;
    latitude: number;
    longitude: number;
    locationLabel?: string | null;
}) {
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    useEffect(() => {
        if (!apiKey || !mapContainerRef.current) return;

        const actual = { lat: latitude, lng: longitude };
        const { center, radius } = getObfuscatedCircleCenter(
            actual,
            `product-${productId}`,
        );

        let cancelled = false;
        loadGoogleMaps(apiKey)
            .then(() => {
                const google = (window as GoogleWindow).google;
                if (cancelled || !mapContainerRef.current || !google?.maps) {
                    return;
                }

                mapRef.current = new google.maps.Map(mapContainerRef.current, {
                    center,
                    zoom: 14,
                    disableDefaultUI: true,
                    zoomControl: true,
                });

                new google.maps.Circle({
                    map: mapRef.current,
                    center,
                    radius,
                    strokeColor: "#3b82f6",
                    strokeOpacity: 0.7,
                    strokeWeight: 2,
                    fillColor: "#60a5fa",
                    fillOpacity: 0.25,
                });
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [apiKey, latitude, longitude, productId]);

    if (!apiKey) {
        return (
            <div className="h-40 rounded-md border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 flex items-center justify-center">
                지도를 표시할 수 없습니다.
            </div>
        );
    }

    return (
        <div className="rounded-md border border-neutral-200 overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-40" />
            <div className="px-3 py-2 text-xs text-neutral-500">
                {locationLabel
                    ? `판매자 대략 위치: ${locationLabel}`
                    : "판매자 대략 위치: 이 원 안 어딘가"}
            </div>
        </div>
    );
}
