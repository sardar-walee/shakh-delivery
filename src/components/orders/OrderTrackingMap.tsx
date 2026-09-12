import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OrderTrackingMapProps {
  storeLocation?: { lat: number; lng: number; name?: string };
  customerLocation?: { lat: number; lng: number; label?: string };
  captainLocation?: { lat: number; lng: number; name?: string };
  status: string;
  isRtl?: boolean;
}

export default function OrderTrackingMap({
  storeLocation = { lat: 36.1912, lng: 44.0092, name: 'Store' }, // Default Erbil City Center
  customerLocation = { lat: 36.2050, lng: 44.0250, label: 'Delivery Address' },
  captainLocation,
  status,
  isRtl = false,
}: OrderTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  // Compute fallback captain position along the line between store and customer if not provided
  const activeCaptainPos = captainLocation || (() => {
    const sLat = storeLocation.lat;
    const sLng = storeLocation.lng;
    const cLat = customerLocation.lat;
    const cLng = customerLocation.lng;

    if (status === 'ON_THE_WAY') {
      return { lat: sLat + (cLat - sLat) * 0.65, lng: sLng + (cLng - sLng) * 0.65, name: 'Captain' };
    }
    if (status === 'PICKED_UP' || status === 'CAPTAIN_ASSIGNED') {
      return { lat: sLat + (cLat - sLat) * 0.25, lng: sLng + (cLng - sLng) * 0.25, name: 'Captain' };
    }
    if (status === 'DELIVERED') {
      return { lat: cLat, lng: cLng, name: 'Captain' };
    }
    return { lat: sLat, lng: sLng, name: 'Captain' };
  })();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = (storeLocation.lat + customerLocation.lat) / 2;
      const initialLng = (storeLocation.lng + customerLocation.lng) / 2;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: isRtl ? 'topleft' : 'topright' }).addTo(map);

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Custom Icon Creators
    const createStoreIcon = () =>
      L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
            </div>
            <div class="absolute -bottom-2 font-bold text-[10px] bg-slate-900/90 text-white px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm">
              ${storeLocation.name || 'Store'}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [0, 0],
      });

    const createCustomerIcon = () =>
      L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="absolute -bottom-2 font-bold text-[10px] bg-slate-900/90 text-white px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm">
              ${customerLocation.label || 'Delivery Point'}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [0, 0],
      });

    const createCaptainIcon = () =>
      L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-2 bg-primary-500/30 rounded-full animate-ping"></div>
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-xl border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
            </div>
            <div class="absolute -bottom-3 font-bold text-[10px] bg-primary-600 text-white px-2 py-0.5 rounded-md whitespace-nowrap shadow-md z-30">
              ${activeCaptainPos.name || 'Captain En Route'}
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [0, 0],
      });

    // Clear existing markers
    (Object.values(markersRef.current) as L.Marker[]).forEach((m) => m?.remove());
    markersRef.current = {};

    // 1. Add Store Marker
    const storeMarker = L.marker([storeLocation.lat, storeLocation.lng], {
      icon: createStoreIcon(),
    }).addTo(map);
    markersRef.current.store = storeMarker;

    // 2. Add Customer Destination Marker
    const customerMarker = L.marker([customerLocation.lat, customerLocation.lng], {
      icon: createCustomerIcon(),
    }).addTo(map);
    markersRef.current.customer = customerMarker;

    // 3. Add Captain Marker if active
    const isCaptainActive = ['CAPTAIN_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'].includes(
      status
    );
    if (isCaptainActive && activeCaptainPos) {
      const captainMarker = L.marker([activeCaptainPos.lat, activeCaptainPos.lng], {
        icon: createCaptainIcon(),
      }).addTo(map);
      markersRef.current.captain = captainMarker;
    }

    // 4. Draw Route Line
    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    const points: L.LatLngExpression[] = [
      [storeLocation.lat, storeLocation.lng],
      [activeCaptainPos.lat, activeCaptainPos.lng],
      [customerLocation.lat, customerLocation.lng],
    ];

    const polyline = L.polyline(points, {
      color: '#0284c7', // Primary Sky/Blue
      weight: 4,
      opacity: 0.85,
      dashArray: status === 'DELIVERED' ? undefined : '6, 8',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    polylineRef.current = polyline;

    // Fit Bounds so all markers fit comfortably
    const group = L.featureGroup([
      storeMarker,
      customerMarker,
      ...(markersRef.current.captain ? [markersRef.current.captain] : []),
    ]);

    map.fitBounds(group.getBounds().pad(0.25), {
      animate: true,
      duration: 0.8,
    });
  }, [
    storeLocation.lat,
    storeLocation.lng,
    customerLocation.lat,
    customerLocation.lng,
    activeCaptainPos.lat,
    activeCaptainPos.lng,
    status,
    isRtl,
  ]);

  return (
    <div className="relative w-full h-72 md:h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Live Map Overlay Tag */}
      <div className="absolute top-3 start-3 z-20 pointer-events-none flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold text-slate-800 dark:text-slate-100">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span>{isRtl ? 'بەدواداچوونی ڕاستەوخۆ بە GPS' : 'Live Realtime GPS Feed'}</span>
      </div>
    </div>
  );
}
