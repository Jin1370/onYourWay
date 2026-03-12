"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
    interface GoogleLatLng {
        lat: () => number;
        lng: () => number;
    }

    interface GoogleMapsClickEvent {
        latLng: GoogleLatLng | null;
    }

    interface GoogleMapsMap {
        setCenter: (coords: Coordinates) => void;
        addListener: (
            eventName: "click",
            handler: (event: GoogleMapsClickEvent) => void,
        ) => void;
    }

    interface GoogleMapsMarker {
        setPosition: (coords: Coordinates) => void;
    }

    interface GoogleMapsNamespace {
        Map: new (
            element: HTMLElement,
            options: {
                center: Coordinates;
                zoom: number;
                disableDefaultUI: boolean;
                zoomControl: boolean;
            },
        ) => GoogleMapsMap;
        Marker: new (options: {
            position: Coordinates;
            map: GoogleMapsMap;
        }) => GoogleMapsMarker;
    }

    interface Window {
        google?: {
            maps?: GoogleMapsNamespace;
        };
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

interface ProductLocationPickerProps {
    defaultLatitude?: number | null;
    defaultLongitude?: number | null;
}

export default function ProductLocationPicker({
    defaultLatitude,
    defaultLongitude,
}: ProductLocationPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<GoogleMapsMap | null>(null);
    const markerRef = useRef<GoogleMapsMarker | null>(null);
    const [coords, setCoords] = useState<Coordinates>(() => {
        if (defaultLatitude != null && defaultLongitude != null) {
            return { lat: defaultLatitude, lng: defaultLongitude };
        }
        return DEFAULT_CENTER;
    });
    const [mapsReady, setMapsReady] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    const locationLabel = useMemo(() => {
        return `위도 ${coords.lat.toFixed(4)}, 경도 ${coords.lng.toFixed(4)}`;
    }, [coords]);

    useEffect(() => {
        if (!apiKey) return;

        let cancelled = false;
        loadGoogleMaps(apiKey)
            .then(() => {
                if (
                    cancelled ||
                    !mapContainerRef.current ||
                    !window.google?.maps
                ) {
                    return;
                }

                if (!mapRef.current) {
                    const map = new window.google.maps.Map(
                        mapContainerRef.current,
                        {
                            center: coords,
                            zoom: 14,
                            disableDefaultUI: true,
                            zoomControl: true,
                        },
                    );
                    mapRef.current = map;
                    markerRef.current = new window.google.maps.Marker({
                        position: coords,
                        map,
                    });
                    map.addListener("click", (event: GoogleMapsClickEvent) => {
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
                <span className="text-sm text-neutral-500">위치 설정</span>
                <button
                    type="button"
                    onClick={() => {
                        if (!navigator.geolocation) {
                            setLocationError(
                                "이 기기/브라우저는 위치 기능을 지원하지 않습니다.",
                            );
                            return;
                        }
                        if (!window.isSecureContext) {
                            setLocationError(
                                "보안 연결(HTTPS)에서만 현재 위치를 사용할 수 있습니다.",
                            );
                            return;
                        }
                        setLocationError(null);
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                setCoords({
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                });
                                setLocationError(null);
                            },
                            (error) => {
                                if (error.code === error.PERMISSION_DENIED) {
                                    setLocationError(
                                        "위치 권한이 차단되어 있습니다. 설정에서 위치 권한을 허용해주세요.",
                                    );
                                    return;
                                }
                                if (error.code === error.POSITION_UNAVAILABLE) {
                                    setLocationError(
                                        "현재 위치를 가져올 수 없습니다. 네트워크/GPS 상태를 확인해주세요.",
                                    );
                                    return;
                                }
                                if (error.code === error.TIMEOUT) {
                                    setLocationError(
                                        "위치 요청 시간이 초과되었습니다. 다시 시도해주세요.",
                                    );
                                    return;
                                }
                                setLocationError(
                                    "현재 위치를 가져오지 못했습니다.",
                                );
                            },
                            { enableHighAccuracy: true, timeout: 8000 },
                        );
                    }}
                    className="text-xs text-myblue "
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
                <div className="flex h-24 w-full items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
                    지도 API 키가 없어 위치 선택 UI를 표시할 수 없습니다.
                </div>
            )}

            <p className="text-xs text-neutral-500">
                {mapsReady
                    ? "지도를 눌러 원하는 위치를 지정해주세요."
                    : "지도를 불러오는 중입니다."}
            </p>

            <input type="hidden" name="latitude" value={coords.lat} />
            <input type="hidden" name="longitude" value={coords.lng} />
            <input type="hidden" name="locationLabel" value={locationLabel} />

            {locationError ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
                        <button
                            type="button"
                            onClick={() => setLocationError(null)}
                            className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-700"
                            aria-label="팝업 닫기"
                        >
                            ✕
                        </button>
                        <h3 className="text-center text-lg font-bold text-neutral-800">
                            위치 권한 안내
                        </h3>
                        <p className="mt-2 text-center text-sm text-neutral-600">
                            {locationError}
                        </p>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
