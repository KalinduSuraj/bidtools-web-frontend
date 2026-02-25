'use client';

import { useState, useEffect } from 'react';

interface GeolocationState {
    coordinates: { lat: number; lng: number } | null;
    error: string | null;
    isLoading: boolean;
}

export function useGeolocation() {
    const [state, setState] = useState<GeolocationState>({
        coordinates: null,
        error: null,
        isLoading: true
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState({
                coordinates: null,
                error: "Geolocation is not supported by your browser.",
                isLoading: false
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    coordinates: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    },
                    error: null,
                    isLoading: false
                });
            },
            (error) => {
                setState({
                    coordinates: null,
                    error: error.message,
                    isLoading: false
                });
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }, []);

    return state;
}
