import { useState, useEffect, useCallback } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  coordinates: Coordinates | null;
  city: string | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  calculateDistance: (lat: number | null | undefined, lon: number | null | undefined) => number | null;
  formatDistance: (distanceKm: number | null) => string | null;
}

// Regional fallback city coordinates for Kurdistan & Iraq
const REGIONAL_CITIES = [
  { name: 'Erbil', nameKu: 'هەولێر', nameAr: 'أربيل', lat: 36.1911, lon: 44.0092 },
  { name: 'Sulaymaniyah', nameKu: 'سلێمانی', nameAr: 'السليمانية', lat: 35.5558, lon: 45.4351 },
  { name: 'Duhok', nameKu: 'دهۆک', nameAr: 'دهوك', lat: 36.8679, lon: 42.9886 },
  { name: 'Kirkuk', nameKu: 'کەرکووک', nameAr: 'كركوك', lat: 35.4681, lon: 44.3922 },
  { name: 'Halabja', nameKu: 'هەڵەبجە', nameAr: 'حلبجة', lat: 35.1778, lon: 45.9861 },
  { name: 'Zakho', nameKu: 'زاخۆ', nameAr: 'زاخو', lat: 37.1436, lon: 42.6872 },
  { name: 'Baghdad', nameKu: 'بەغدا', nameAr: 'بغداد', lat: 33.3152, lon: 44.3661 },
];

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useGeolocation(): GeolocationState {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(() => {
    const cached = localStorage.getItem('shakh_user_coords');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [city, setCity] = useState<string | null>(() => {
    return localStorage.getItem('shakh_user_city') || null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveCityFromCoordinates = useCallback(async (lat: number, lon: number) => {
    try {
      // 1. Attempt reverse geocoding via OpenStreetMap Nominatim
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
        {
          headers: { 'Accept-Language': 'en,ckb,ar' },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const address = data.address || {};
        const detectedCity =
          address.city ||
          address.town ||
          address.state ||
          address.county ||
          address.region ||
          null;

        if (detectedCity) {
          setCity(detectedCity);
          localStorage.setItem('shakh_user_city', detectedCity);
          return;
        }
      }
    } catch {
      // Ignore network abort or failure, proceed to regional fallback
    }

    // 2. Fallback to closest regional city
    let closestCity = REGIONAL_CITIES[0].name;
    let minDistance = Infinity;

    for (const item of REGIONAL_CITIES) {
      const dist = calculateDistance(lat, lon, item.lat, item.lon);
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = item.name;
      }
    }

    setCity(closestCity);
    localStorage.setItem('shakh_user_city', closestCity);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(coords);
        localStorage.setItem('shakh_user_coords', JSON.stringify(coords));
        setLoading(false);
        resolveCityFromCoordinates(coords.latitude, coords.longitude);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information unavailable');
            break;
          case err.TIMEOUT:
            setError('Location request timed out');
            break;
          default:
            setError('Failed to acquire location');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [resolveCityFromCoordinates]);

  // Request automatically on initial mount if not cached
  useEffect(() => {
    if (!coordinates) {
      requestLocation();
    } else if (!city) {
      resolveCityFromCoordinates(coordinates.latitude, coordinates.longitude);
    }
  }, [coordinates, city, requestLocation, resolveCityFromCoordinates]);

  const calcDistance = useCallback(
    (lat: number | null | undefined, lon: number | null | undefined): number | null => {
      if (
        !coordinates ||
        lat === null ||
        lat === undefined ||
        lon === null ||
        lon === undefined
      ) {
        return null;
      }
      return calculateDistance(coordinates.latitude, coordinates.longitude, lat, lon);
    },
    [coordinates]
  );

  const formatDistance = useCallback((distanceKm: number | null): string | null => {
    if (distanceKm === null || distanceKm === undefined) return null;
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  }, []);

  return {
    coordinates,
    city,
    loading,
    error,
    requestLocation,
    calculateDistance: calcDistance,
    formatDistance,
  };
}
