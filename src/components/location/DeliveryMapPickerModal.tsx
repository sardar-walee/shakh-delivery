import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Crosshair,
  Search,
  X,
  Check,
  Building,
  Home,
  Briefcase,
  Navigation,
  Phone,
  FileText,
  Compass,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useAddressStore } from '../../store/useAddressStore';
import { useAuthStore } from '../../store/useAuthStore';
import { AddressTag, DeliveryAddress } from '../../types/address.types';
import { ALL_GOVERNORATES } from '../../data/locations';

// Custom Animated SVG Marker for Map
const createCustomMarkerIcon = (tag: AddressTag = 'home') => {
  const getIconSvg = () => {
    switch (tag) {
      case 'work':
      case 'office':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
      case 'other':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
      case 'home':
      default:
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    }
  };

  const html = `
    <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing">
      <div class="relative flex flex-col items-center">
        <!-- Badge Pin Top -->
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-primary-600 shadow-xl border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-primary-500/40 transform hover:scale-110 transition-transform">
          ${getIconSvg()}
        </div>
        <!-- Pointer Tip -->
        <div class="w-2.5 h-2.5 bg-rose-600 rotate-45 -mt-1.5 border-r-2 border-b-2 border-white dark:border-slate-900"></div>
        <!-- Pulse ring on ground -->
        <div class="w-4 h-2 bg-rose-500/30 rounded-full blur-[1px] mt-0.5 animate-ping"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-shakh-marker',
    iconSize: [40, 48],
    iconAnchor: [20, 48],
  });
};

// Map click & drag handler component
function MapInteractionHandler({
  position,
  onChangePosition,
}: {
  position: [number, number];
  onChangePosition: (pos: [number, number]) => void;
}) {
  const map = useMapEvents({
    click(e) {
      onChangePosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

// Map center synchronizer
function MapRecenter({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export default function DeliveryMapPickerModal() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';

  const { isPickerOpen, closePicker, editingAddress, saveAddress } = useAddressStore();
  const { user, profile } = useAuthStore();

  // Position state (lat, lng) - default to Erbil or editing address
  const [coords, setCoords] = useState<[number, number]>([36.1911, 44.0092]);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [mapZoom, setMapZoom] = useState(14);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Search places on map
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Address form fields
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState<AddressTag>('home');
  const [city, setCity] = useState('Erbil');
  const [district, setDistrict] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [floorApartment, setFloorApartment] = useState('');
  const [nearestLandmark, setNearestLandmark] = useState('');
  const [phoneContact, setPhoneContact] = useState('');
  const [driverInstructions, setDriverInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isPickerOpen) {
      setGpsError(null);
      setSaveSuccess(false);
      setSearchQuery('');
      setSearchResults([]);

      if (editingAddress) {
        setCoords([editingAddress.latitude, editingAddress.longitude]);
        setTitle(editingAddress.title);
        setTag(editingAddress.tag);
        setCity(editingAddress.city);
        setDistrict(editingAddress.district || '');
        setStreetAddress(editingAddress.street_address);
        setBuildingName(editingAddress.building_name || '');
        setFloorApartment(editingAddress.floor_apartment || '');
        setNearestLandmark(editingAddress.nearest_landmark || '');
        setPhoneContact(editingAddress.phone_contact || profile?.phone || '');
        setDriverInstructions(editingAddress.driver_instructions || '');
        setIsDefault(editingAddress.is_default);
      } else {
        // New address: default title based on language
        setTitle(currentLang === 'ku' ? 'ماڵەوە' : currentLang === 'ar' ? 'المنزل' : 'Home');
        setTag('home');
        setCity('Erbil');
        setDistrict('');
        setStreetAddress('');
        setBuildingName('');
        setFloorApartment('');
        setNearestLandmark('');
        setPhoneContact(profile?.phone || '');
        setDriverInstructions('');
        setIsDefault(true);

        // Auto request GPS if opening fresh
        handleGeolocationRequest();
      }
    }
  }, [isPickerOpen, editingAddress]);

  // Geolocation API Handler
  const handleGeolocationRequest = () => {
    if (!navigator.geolocation) {
      setGpsError(
        currentLang === 'ku'
          ? 'گەڕۆکەکەت پشتگیری GPS ناکات.'
          : currentLang === 'ar'
          ? 'المتصفح لا يدعم تحديد الموقع GPS.'
          : 'Geolocation is not supported by your browser.'
      );
      return;
    }

    setIsLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords([latitude, longitude]);
        setGpsAccuracy(accuracy);
        setMapZoom(17);
        setIsLocatingGps(false);

        // Trigger reverse geocoding
        performReverseGeocoding(latitude, longitude);
      },
      (err) => {
        setIsLocatingGps(false);
        if (err.code === 1) {
          setGpsError(
            currentLang === 'ku'
              ? 'تکایە ڕێگە بە دەسەڵاتی شوێن (Location Permission) بدە لە گەڕۆکەکەتدا.'
              : currentLang === 'ar'
              ? 'يرجى السماح بصلاحية الموقع في المتصفح.'
              : 'Please allow location permission in your browser.'
          );
        } else {
          setGpsError(
            currentLang === 'ku'
              ? 'نەتوانرا شوێنی ڕاستەقینە دیاریبکرێت.'
              : currentLang === 'ar'
              ? 'تعذر جلب إحداثيات الموقع الحالي.'
              : 'Could not retrieve your GPS location.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Reverse Geocoding with Fallback
  const performReverseGeocoding = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      // Find closest known city from local database first
      let closestGov = ALL_GOVERNORATES[0];
      let minDistance = Infinity;

      for (const gov of ALL_GOVERNORATES) {
        const dLat = ((gov.latitude - lat) * Math.PI) / 180;
        const dLon = ((gov.longitude - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((gov.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        if (dist < minDistance) {
          minDistance = dist;
          closestGov = gov;
        }
      }

      const govName =
        currentLang === 'ku'
          ? closestGov.nameKu
          : currentLang === 'ar'
          ? closestGov.nameAr
          : closestGov.nameEn;

      setCity(closestGov.nameEn);

      // Attempt OpenStreetMap Nominatim reverse geocode
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'Accept-Language': currentLang === 'ku' ? 'ckb,ku,ar,en' : currentLang === 'ar' ? 'ar,en' : 'en',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            const road = addr.road || addr.street || addr.pedestrian || addr.suburb || '';
            const neighbourhood = addr.neighbourhood || addr.quarter || addr.subdistrict || addr.district || '';
            const detectedCity = addr.city || addr.town || addr.county || govName;

            if (road || neighbourhood) {
              setStreetAddress([road, neighbourhood].filter(Boolean).join(', '));
            } else if (data.display_name) {
              const parts = data.display_name.split(',');
              setStreetAddress(parts.slice(0, 2).join(', ').trim());
            }

            if (neighbourhood) {
              setDistrict(neighbourhood);
            }
          }
        }
      } catch {
        // Fallback to local coordinate description if offline/blocked
        if (!streetAddress) {
          setStreetAddress(`${govName}, GPS [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
        }
      }
    } catch (e) {
      console.warn('Reverse geocode error:', e);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Search Address on OpenStreetMap
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const queryWithCountry = `${searchQuery.trim()}, Iraq`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryWithCountry)}&limit=5&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data || []);
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setCoords([lat, lon]);
    setMapZoom(16);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);
    performReverseGeocoding(lat, lon);
  };

  // When marker is dragged or clicked
  const handleMarkerDragEnd = (e: any) => {
    const marker = e.target;
    const position = marker.getLatLng();
    setCoords([position.lat, position.lng]);
    performReverseGeocoding(position.lat, position.lng);
  };

  const handleMapPositionChange = (newPos: [number, number]) => {
    setCoords(newPos);
    performReverseGeocoding(newPos[0], newPos[1]);
  };

  // Tag button click handler
  const handleTagSelect = (selectedTag: AddressTag) => {
    setTag(selectedTag);
    if (!title || ['ماڵەوە', 'المنزل', 'Home', 'شوێنی کار', 'العمل', 'Work', 'ئۆفیس', 'المكتب', 'Office'].includes(title)) {
      if (selectedTag === 'home') setTitle(currentLang === 'ku' ? 'ماڵەوە' : currentLang === 'ar' ? 'المنزل' : 'Home');
      if (selectedTag === 'work') setTitle(currentLang === 'ku' ? 'شوێنی کار' : currentLang === 'ar' ? 'العمل' : 'Work');
      if (selectedTag === 'office') setTitle(currentLang === 'ku' ? 'ئۆفیس' : currentLang === 'ar' ? 'المكتب' : 'Office');
      if (selectedTag === 'other') setTitle(currentLang === 'ku' ? 'شوێنی تر' : currentLang === 'ar' ? 'موقع آخر' : 'Other');
    }
  };

  // Submit and Save Address to User Profile
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetAddress.trim()) {
      alert(currentLang === 'ku' ? 'تکایە ناونیشانی کۆڵان یان گەڕەک بنووسە' : 'Please enter street or neighborhood name');
      return;
    }

    setIsSaving(true);
    try {
      await saveAddress(
        {
          id: editingAddress?.id,
          title: title.trim() || (tag === 'home' ? 'Home' : 'Address'),
          tag,
          city,
          district: district.trim() || undefined,
          street_address: streetAddress.trim(),
          building_name: buildingName.trim() || undefined,
          floor_apartment: floorApartment.trim() || undefined,
          nearest_landmark: nearestLandmark.trim() || undefined,
          latitude: coords[0],
          longitude: coords[1],
          phone_contact: phoneContact.trim() || undefined,
          driver_instructions: driverInstructions.trim() || undefined,
          is_default: isDefault,
        },
        user?.id
      );

      setSaveSuccess(true);
      setTimeout(() => {
        closePicker();
      }, 500);
    } catch (err: any) {
      console.error('Failed to save delivery address:', err);
      alert('Failed to save address: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isPickerOpen) return null;

  const customIcon = createCustomMarkerIcon(tag);

  return (
    <div
      id="delivery-map-picker-modal"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 md:p-4 overflow-hidden animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-full md:h-[90vh] md:max-h-[850px] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white leading-tight">
                {editingAddress
                  ? currentLang === 'ku'
                    ? 'دەستکاریکردنی ناونیشانی گەیاندن'
                    : currentLang === 'ar'
                    ? 'تعديل عنوان التوصيل'
                    : 'Edit Delivery Address'
                  : currentLang === 'ku'
                  ? 'دیاریکردنی ناونیشانی گەیاندن لەسەر نەخشە'
                  : currentLang === 'ar'
                  ? 'تحديد عنوان التوصيل على الخريطة'
                  : 'Set Delivery Address on Map'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentLang === 'ku'
                  ? 'شوێنی ماڵ یان ئۆفیسەکەت دیاریبکە بۆ گەیاندنی خێرا و ڕاستەوخۆ'
                  : currentLang === 'ar'
                  ? 'حدد موقع منزلك أو عملك لتوصيل سريع ودقيق'
                  : 'Pinpoint your exact location for accurate delivery'}
              </p>
            </div>
          </div>

          <button
            id="close-delivery-picker-btn"
            onClick={closePicker}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Split layout (Map on Top/Left, Form on Bottom/Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* MAP SECTION */}
          <div className="relative w-full md:w-1/2 h-72 md:h-full bg-slate-100 dark:bg-slate-950 flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
            {/* Search Bar Overlay on Map */}
            <div className="absolute top-3 inset-x-3 z-[1000]">
              <form onSubmit={handleSearchSubmit} className="relative shadow-lg rounded-2xl">
                <div className="absolute inset-y-0 start-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    currentLang === 'ku'
                      ? 'گەڕان بۆ شوێن، شەقام یان مۆڵ...'
                      : currentLang === 'ar'
                      ? 'ابحث عن شارع، حي أو معلم...'
                      : 'Search street, mall or landmark...'
                  }
                  className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 pl-10 pr-10 rtl:pl-10 rtl:pr-10 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500/30 outline-none shadow-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute inset-y-0 end-0 pr-3 rtl:pl-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Search Suggestions Dropdown */}
              {searchResults.length > 0 && (
                <div className="mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className="w-full text-start p-3 hover:bg-rose-50 dark:hover:bg-slate-800 flex items-start gap-2.5 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.display_name.split(',')[0]}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {item.display_name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* GPS Locate Button on Map */}
            <button
              id="gps-locate-current-btn"
              type="button"
              onClick={handleGeolocationRequest}
              disabled={isLocatingGps}
              className="absolute bottom-4 end-4 z-[1000] p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 group"
              title={currentLang === 'ku' ? 'دیاریکردنی شوێنی ئێستام (GPS)' : 'Locate My Position'}
            >
              <Crosshair
                className={`w-5 h-5 text-primary-600 dark:text-primary-400 ${
                  isLocatingGps ? 'animate-spin' : 'group-hover:rotate-45'
                } transition-transform`}
              />
              <span className="text-xs font-bold hidden sm:inline">
                {isLocatingGps
                  ? currentLang === 'ku'
                    ? 'دیاریکردنی GPS...'
                    : 'Locating...'
                  : currentLang === 'ku'
                  ? 'شوێنی ئێستام'
                  : currentLang === 'ar'
                  ? 'موقعي الحالي'
                  : 'My Location'}
              </span>
            </button>

            {/* GPS Error Alert */}
            {gpsError && (
              <div className="absolute top-16 inset-x-3 z-[1000] p-2.5 bg-rose-50 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800 shadow-md flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-[11px]">{gpsError}</span>
                <button onClick={() => setGpsError(null)} className="text-rose-400 hover:text-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Coordinates Floating Badge */}
            <div className="absolute bottom-4 start-4 z-[1000] px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono shadow-md pointer-events-none flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-primary-400" />
              <span>
                {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
              </span>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="w-full h-full">
              <MapContainer
                center={coords}
                zoom={mapZoom}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                />

                <MapRecenter center={coords} zoom={mapZoom} />
                <MapInteractionHandler
                  position={coords}
                  onChangePosition={handleMapPositionChange}
                />

                {/* Accuracy Radius Circle if located via GPS */}
                {gpsAccuracy && gpsAccuracy < 500 && (
                  <Circle
                    center={coords}
                    radius={gpsAccuracy}
                    pathOptions={{
                      color: '#e11d48',
                      fillColor: '#f43f5e',
                      fillOpacity: 0.12,
                      weight: 1,
                    }}
                  />
                )}

                {/* Delivery Pin Marker */}
                <Marker
                  position={coords}
                  draggable={true}
                  icon={customIcon}
                  eventHandlers={{
                    dragend: handleMarkerDragEnd,
                  }}
                />
              </MapContainer>
            </div>
          </div>

          {/* ADDRESS FORM SECTION */}
          <div className="w-full md:w-1/2 flex-1 overflow-y-auto p-5 md:p-6 bg-white dark:bg-slate-900">
            <form onSubmit={handleSaveAddress} className="space-y-4">
              {/* Tag Selector Buttons (Home, Work, Office, Other) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {currentLang === 'ku' ? 'جۆری شوێن' : currentLang === 'ar' ? 'نوع الموقع' : 'Location Type'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'home', labelKu: 'ماڵ', labelAr: 'منزل', labelEn: 'Home', icon: Home },
                    { id: 'work', labelKu: 'کار', labelAr: 'عمل', labelEn: 'Work', icon: Briefcase },
                    { id: 'office', labelKu: 'ئۆفیس', labelAr: 'مكتب', labelEn: 'Office', icon: Building },
                    { id: 'other', labelKu: 'تر', labelAr: 'آخر', labelEn: 'Other', icon: MapPin },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = tag === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleTagSelect(item.id as AddressTag)}
                        className={`py-2.5 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/50 border-primary-500 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500/20 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>
                          {currentLang === 'ku'
                            ? item.labelKu
                            : currentLang === 'ar'
                            ? item.labelAr
                            : item.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & City row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {currentLang === 'ku' ? 'ناوی ناونیشانەکە' : currentLang === 'ar' ? 'اسم العنوان' : 'Address Title'} *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. My Apartment, Home, Office 302"
                    className="input-field text-xs py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {currentLang === 'ku' ? 'شار / پارێزگا' : currentLang === 'ar' ? 'المدينة' : 'City / Governorate'} *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-field text-xs py-2.5"
                  >
                    {ALL_GOVERNORATES.map((g) => (
                      <option key={g.id} value={g.nameEn}>
                        {currentLang === 'ku' ? g.nameKu : currentLang === 'ar' ? g.nameAr : g.nameEn} (
                        {g.region === 'Kurdistan' ? 'Kurdistan' : 'Iraq'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Street & Neighborhood */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {currentLang === 'ku'
                      ? 'شەقام و گەڕەک'
                      : currentLang === 'ar'
                      ? 'الشارع والحي'
                      : 'Street & Neighborhood'} *
                  </label>
                  {isReverseGeocoding && (
                    <span className="text-[10px] text-primary-600 flex items-center gap-1 font-medium animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>{currentLang === 'ku' ? 'دۆزینەوەی ناونیشان...' : 'Resolving street...'}</span>
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  required
                  placeholder={
                    currentLang === 'ku'
                      ? 'شەقامی سەرەکی، ناوی گەڕەک، نزیک مۆڵ یان قوتابخانە'
                      : 'Main Street, District / Neighborhood name'
                  }
                  className="input-field text-xs py-2.5"
                />
              </div>

              {/* Building & Apartment row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {currentLang === 'ku' ? 'ناوی بینا / ژمارەی خانوو' : currentLang === 'ar' ? 'البناية / رقم المنزل' : 'Building / House No.'}
                  </label>
                  <input
                    type="text"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    placeholder="e.g. Tower B, House 42"
                    className="input-field text-xs py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {currentLang === 'ku' ? 'نهۆم / شوقە' : currentLang === 'ar' ? 'الطابق / الشقة' : 'Floor / Apartment'}
                  </label>
                  <input
                    type="text"
                    value={floorApartment}
                    onChange={(e) => setFloorApartment(e.target.value)}
                    placeholder="e.g. Floor 3, Apt 12"
                    className="input-field text-xs py-2.5"
                  />
                </div>
              </div>

              {/* Nearest Landmark */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {currentLang === 'ku'
                    ? 'نیشانەی ناسراو (Landmark)'
                    : currentLang === 'ar'
                    ? 'أقرب نقطة دالة'
                    : 'Nearest Landmark (Optional)'}
                </label>
                <input
                  type="text"
                  value={nearestLandmark}
                  onChange={(e) => setNearestLandmark(e.target.value)}
                  placeholder={
                    currentLang === 'ku'
                      ? 'بۆ نموونە: تەنیشت مزگەوت، پشت دەرمانخانە'
                      : 'e.g. Next to Green Pharmacy, Behind the Grand Mosque'
                  }
                  className="input-field text-xs py-2.5"
                />
              </div>

              {/* Contact Phone & Driver Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {currentLang === 'ku' ? 'ژمارەی مۆبایلی پەیوەندی' : currentLang === 'ar' ? 'رقم الهاتف' : 'Contact Phone'}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneContact}
                      onChange={(e) => setPhoneContact(e.target.value)}
                      placeholder="+964 750 000 0000"
                      className="input-field text-xs py-2.5 ltr:pl-8 rtl:pr-8"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 ltr:left-2.5 rtl:right-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {currentLang === 'ku' ? 'تێبینی بۆ شۆفێری گەیاندن' : currentLang === 'ar' ? 'ملاحظات للسائق' : 'Driver Instructions'}
                  </label>
                  <input
                    type="text"
                    value={driverInstructions}
                    onChange={(e) => setDriverInstructions(e.target.value)}
                    placeholder="e.g. Ring bell, Leave at gate"
                    className="input-field text-xs py-2.5"
                  />
                </div>
              </div>

              {/* Default Address Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none">
                  {currentLang === 'ku'
                    ? 'دیاریکردن وەک ناونیشانی سەرەکی و بنەڕەتی بۆ داواکارییەکان'
                    : currentLang === 'ar'
                    ? 'تعيين كعنوان رئيسي وتلقائي للطلبات'
                    : 'Set as my default delivery address'}
                </span>
              </label>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={closePicker}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                >
                  {currentLang === 'ku' ? 'پاشگەزبوونەوە' : currentLang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  id="save-delivery-address-submit-btn"
                  type="submit"
                  disabled={isSaving}
                  className="flex-2 btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{currentLang === 'ku' ? 'پاشەکەوتکردن...' : 'Saving to Profile...'}</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>{currentLang === 'ku' ? 'پاشەکەوتکرا!' : 'Saved to Profile!'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        {editingAddress
                          ? currentLang === 'ku'
                            ? 'نوێکردنەوە لە پڕۆفایل'
                            : 'Update Address'
                          : currentLang === 'ku'
                          ? 'پاشەکەوتکردن لە پڕۆفایل و داواکاری'
                          : currentLang === 'ar'
                          ? 'حفظ في الملف الشخصي'
                          : 'Save to Profile'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
