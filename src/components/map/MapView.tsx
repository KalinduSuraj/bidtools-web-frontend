'use client';

import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { MAPS_KEY } from '@/lib/constants';
import { LoadingWindow } from '@/components/ui/LoadingWindow';
import { ErrorWindow } from '@/components/ui/ErrorWindow';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '16px'
};

const defaultCenter = {
    lat: 37.7749, // Default to SF
    lng: -122.4194
};

// Dark style to match application theme
const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#F7C873" }]
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }]
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }]
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }]
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }]
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }]
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }]
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }]
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }]
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }]
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }]
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }]
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }]
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }]
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }]
    }
];

export interface MapViewProps {
    center?: { lat: number; lng: number };
    zoom?: number;
    markers?: Array<{ id: string; lat: number; lng: number; title?: string }>;
    radius?: number; // In meters
    onMapClick?: (e: google.maps.MapMouseEvent) => void;
    interactive?: boolean;
}

export function MapView({
    center = defaultCenter,
    zoom = 12,
    markers = [],
    radius,
    onMapClick,
    interactive = true
}: MapViewProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: MAPS_KEY
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    if (loadError) {
        return <ErrorWindow title="Map Error" message="Failed to load Google Maps." fullScreen />;
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-base rounded-2xl border border-subtle">
                <LoadingWindow message="Loading Interactive Map..." />
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={interactive ? onMapClick : undefined}
            options={{
                styles: darkMapStyle,
                disableDefaultUI: !interactive,
                zoomControl: interactive,
                gestureHandling: interactive ? 'auto' : 'none'
            }}
        >
            {/* Render Markers */}
            {markers.map(marker => (
                <Marker
                    key={marker.id}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    title={marker.title}
                />
            ))}

            {/* Render Radius Circle if radius is provided */}
            {radius && (
                <Circle
                    center={center}
                    radius={radius}
                    options={{
                        strokeColor: "#F7C873",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "#F7C873",
                        fillOpacity: 0.15,
                    }}
                />
            )}
        </GoogleMap>
    );
}
