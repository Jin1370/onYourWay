"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
    interface Window {
        google?: any;
    }
}

type Coordinates = {
    lat: number;
    lng: number;
};

const DEFAULT_CENTER: Coordinates = {
    lat: 37.5665,
    lng: 126.978,
};

let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string) {
    if (typeof window === "undefined") return Promise.resolve();
    if (window.google?.maps) return Promise.resolve();
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

export default function ProductLocationPicker({
    defaultLatitude,
    defaultLongitude,
}: {
    defaultLatitude?: number | null;
    defaultLongitude?: number | null;
}) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [coords, setCoords] = useState<Coordinates | null>(
        defaultLatitude != null && defaultLongitude != null
            ? { lat: defaultLatitude, lng: defaultLongitude }
            : null,
    );
    const [mapsReady, setMapsReady] = useState(false);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    const locationLabel = useMemo(() => {
        if (!coords) return "";
        return `위도 ${coords.lat.toFixed(4)}, 경도 ${coords.lng.toFixed(4)}`;
    }, [coords]);

    useEffect(() => {
        if (coords) return;
        if (!navigator.geolocation) {
            setCoords(DEFAULT_CENTER);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            () => {
                setCoords(DEFAULT_CENTER);
            },
            { enableHighAccuracy: true, timeout: 8000 },
        );
    }, [coords]);

    useEffect(() => {
        if (!apiKey || !coords) return;

        let cancelled = false;
        loadGoogleMaps(apiKey)
            .then(() => {
                if (cancelled || !mapContainerRef.current || !window.google?.maps) {
                    return;
                }

                if (!mapRef.current) {
                    mapRef.current = new window.google.maps.Map(
                        mapContainerRef.current,
                        {
                            center: coords,
                            zoom: 14,
                            disableDefaultUI: true,
                            zoomControl: true,
                        },
                    );
                    markerRef.current = new window.google.maps.Marker({
                        position: coords,
                        map: mapRef.current,
                    });
                    mapRef.current.addListener("click", (event: any) => {
                        if (!event.latLng) return;
                        const next = {
                            lat: event.latLng.lat(),
                            lng: event.latLng.lng(),
                        };
                        markerRef.current?.setPosition(next);
                        setCoords(next);
                    });
                } else {
                    mapRef.current.setCenter(coords);
                    markerRef.current?.setPosition(coords);
                }
                setMapsReady(true);
            })
            .catch(() => {
                setMapsReady(false);
            });

        return () => {
            cancelled = true;
        };
    }, [apiKey, coords]);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">
                    판매 위치 (대략)
                </span>
                <button
                    type="button"
                    onClick={() => {
                        if (!navigator.geolocation) return;
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                setCoords({
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                });
                            },
                            () => {},
                            { enableHighAccuracy: true, timeout: 8000 },
                        );
                    }}
                    className="text-xs text-myblue"
                >
                    현재 위치 사용
                </button>
            </div>

            {apiKey ? (
                <div
                    ref={mapContainerRef}
                    className="h-52 w-full rounded-md border border-neutral-200"
                />
            ) : (
                <div className="h-24 w-full rounded-md border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 flex items-center justify-center">
                    지도 키가 없어 위치 선택을 표시할 수 없습니다.
                </div>
            )}

            <p className="text-xs text-neutral-500">
                {mapsReady
                    ? "지도를 눌러 판매 위치를 지정하세요."
                    : "현재 위치를 기준으로 지도를 준비 중입니다."}
            </p>

            <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
            <input type="hidden" name="longitude" value={coords?.lng ?? ""} />
            <input type="hidden" name="locationLabel" value={locationLabel} />
        </div>
    );
}
