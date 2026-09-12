import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Search,
  Crosshair,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Building2,
  Navigation,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ALL_GOVERNORATES,
  Governorate,
  District,
  SubDistrict,
  getAllFlattenedLocations,
  FlatLocationItem,
} from '../../data/locations';
import { useLocationStore } from '../../store/useLocationStore';
import { useAddressStore } from '../../store/useAddressStore';

export default function LocationSelectModal() {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language || 'ku') as 'ku' | 'ar' | 'en';
  const isRtl = currentLang !== 'en';
  const { openPicker } = useAddressStore();

  const {
    isModalOpen,
    closeModal,
    currentLocation,
    setLocation,
    selectByItem,
    requestGpsLocation,
    gpsLoading,
    gpsError,
  } = useLocationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<'All' | 'Kurdistan' | 'Federal Iraq'>('All');

  // Drilldown hierarchy state
  const [activeGov, setActiveGov] = useState<Governorate | null>(null);
  const [activeDist, setActiveDist] = useState<District | null>(null);

  // Reset drilldown when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setSearchQuery('');
      // Pre-select the governorate of current location if found
      const foundGov = ALL_GOVERNORATES.find((g) => g.id === currentLocation.governorateId);
      if (foundGov) {
        setActiveGov(foundGov);
        if (currentLocation.districtId) {
          const foundDist = foundGov.districts.find((d) => d.id === currentLocation.districtId);
          if (foundDist) {
            setActiveDist(foundDist);
          }
        }
      }
    }
  }, [isModalOpen, currentLocation]);

  const flattenedList = useMemo(() => getAllFlattenedLocations(), []);

  // Search filtered results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    return flattenedList
      .filter((item) => {
        const matchGovKu = item.governorateName.ku.toLowerCase().includes(q);
        const matchGovAr = item.governorateName.ar.toLowerCase().includes(q);
        const matchGovEn = item.governorateName.en.toLowerCase().includes(q);

        const matchDistKu = item.districtName?.ku.toLowerCase().includes(q) || false;
        const matchDistAr = item.districtName?.ar.toLowerCase().includes(q) || false;
        const matchDistEn = item.districtName?.en.toLowerCase().includes(q) || false;

        const matchSubKu = item.subDistrictName?.ku.toLowerCase().includes(q) || false;
        const matchSubAr = item.subDistrictName?.ar.toLowerCase().includes(q) || false;
        const matchSubEn = item.subDistrictName?.en.toLowerCase().includes(q) || false;

        return (
          matchGovKu ||
          matchGovAr ||
          matchGovEn ||
          matchDistKu ||
          matchDistAr ||
          matchDistEn ||
          matchSubKu ||
          matchSubAr ||
          matchSubEn
        );
      })
      .slice(0, 30);
  }, [searchQuery, flattenedList]);

  // Filtered governorates by region
  const filteredGovernorates = useMemo(() => {
    if (selectedRegionFilter === 'All') return ALL_GOVERNORATES;
    return ALL_GOVERNORATES.filter((g) => g.region === selectedRegionFilter);
  }, [selectedRegionFilter]);

  if (!isModalOpen) return null;

  const handleSelectGovernorate = (gov: Governorate) => {
    setActiveGov(gov);
    setActiveDist(null);
  };

  const handleSelectDistrict = (dist: District) => {
    setActiveDist(dist);
  };

  const handleSelectSubDistrict = (sub: SubDistrict) => {
    if (!activeGov || !activeDist) return;

    const getGovName = () => (currentLang === 'ku' ? activeGov.nameKu : currentLang === 'ar' ? activeGov.nameAr : activeGov.nameEn);
    const getDistName = () => (currentLang === 'ku' ? activeDist.nameKu : currentLang === 'ar' ? activeDist.nameAr : activeDist.nameEn);
    const getSubName = () => (currentLang === 'ku' ? sub.nameKu : currentLang === 'ar' ? sub.nameAr : sub.nameEn);

    setLocation({
      governorateId: activeGov.id,
      governorateName: getGovName(),
      districtId: activeDist.id,
      districtName: getDistName(),
      subDistrictId: sub.id,
      subDistrictName: getSubName(),
      displayLabel:
        currentLang === 'ku'
          ? `${getSubName()} - ${getDistName()} (${getGovName()})`
          : currentLang === 'ar'
          ? `${getSubName()} - ${getDistName()} (${getGovName()})`
          : `${sub.nameEn}, ${activeDist.nameEn} (${activeGov.nameEn})`,
      latitude: sub.latitude || activeDist.latitude || activeGov.latitude,
      longitude: sub.longitude || activeDist.longitude || activeGov.longitude,
      isGps: false,
    });
  };

  const handleSelectDirectGov = (gov: Governorate) => {
    const getGovName = () => (currentLang === 'ku' ? gov.nameKu : currentLang === 'ar' ? gov.nameAr : gov.nameEn);
    setLocation({
      governorateId: gov.id,
      governorateName: getGovName(),
      displayLabel:
        currentLang === 'ku'
          ? `${getGovName()} (${gov.region === 'Kurdistan' ? 'هەرێمی کوردستان' : 'عێراق'})`
          : currentLang === 'ar'
          ? `${getGovName()} (${gov.region === 'Kurdistan' ? 'إقليم كوردستان' : 'العراق'})`
          : `${gov.nameEn}, ${gov.region === 'Kurdistan' ? 'Kurdistan' : 'Iraq'}`,
      latitude: gov.latitude,
      longitude: gov.longitude,
      isGps: false,
    });
  };

  const handleSelectDirectDist = (dist: District) => {
    if (!activeGov) return;
    const getGovName = () => (currentLang === 'ku' ? activeGov.nameKu : currentLang === 'ar' ? activeGov.nameAr : activeGov.nameEn);
    const getDistName = () => (currentLang === 'ku' ? dist.nameKu : currentLang === 'ar' ? dist.nameAr : dist.nameEn);

    setLocation({
      governorateId: activeGov.id,
      governorateName: getGovName(),
      districtId: dist.id,
      districtName: getDistName(),
      displayLabel:
        currentLang === 'ku'
          ? `${getDistName()}، ${getGovName()}`
          : currentLang === 'ar'
          ? `${getDistName()}، ${getGovName()}`
          : `${dist.nameEn}, ${activeGov.nameEn}`,
      latitude: dist.latitude || activeGov.latitude,
      longitude: dist.longitude || activeGov.longitude,
      isGps: false,
    });
  };

  const getName = (obj: { nameKu: string; nameAr: string; nameEn: string }) => {
    if (currentLang === 'ku') return obj.nameKu;
    if (currentLang === 'ar') return obj.nameAr;
    return obj.nameEn;
  };

  return (
    <div
      id="location-modal-overlay"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 md:p-4 transition-all duration-300"
    >
      <div
        id="location-modal-card"
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-6 duration-300"
      >
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                {currentLang === 'ku'
                  ? 'دیاریکردنی شار و شوێنی داواکاری'
                  : currentLang === 'ar'
                  ? 'تحديد المدينة والموقع'
                  : 'Select City & Location'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentLang === 'ku'
                  ? 'هەموو پارێزگا، قەزا و ناحیەکانی کوردستان و عێراق'
                  : currentLang === 'ar'
                  ? 'جميع محافظات وأقضية ونواحي كوردستان والعراق'
                  : 'All governorates, districts & sub-districts'}
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Quick Location Action Buttons: GPS & Map Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* GPS Button */}
            <button
              onClick={() => requestGpsLocation(currentLang)}
              disabled={gpsLoading}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-primary-500/10 to-rose-500/10 hover:from-primary-500/20 hover:to-rose-500/20 border border-primary-200/50 dark:border-primary-800/40 text-primary-700 dark:text-primary-300 font-semibold transition-all group text-start"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <Crosshair className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">
                    {currentLang === 'ku'
                      ? 'شوێنی ئێستام (GPS)'
                      : currentLang === 'ar'
                      ? 'موقعي الحالي (GPS)'
                      : 'My GPS Location'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal line-clamp-1">
                    {currentLang === 'ku' ? 'دۆزینەوەی خۆکار' : 'Automatic detection'}
                  </span>
                </div>
              </div>
            </button>

            {/* Map Picker Button */}
            <button
              onClick={() => {
                closeModal();
                openPicker(null);
              }}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border border-blue-200/50 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 font-semibold transition-all group text-start"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">
                    {currentLang === 'ku'
                      ? 'دیاریکردن لەسەر نەخشە'
                      : currentLang === 'ar'
                      ? 'تحديد على الخريطة'
                      : 'Pin on Live Map'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal line-clamp-1">
                    {currentLang === 'ku' ? 'پاشەکەوتکردن لە پڕۆفایل' : 'Save to profile'}
                  </span>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            </button>
          </div>

          {gpsError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400">
              {gpsError}
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 start-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                currentLang === 'ku'
                  ? 'گەڕان بۆ هەر شار، قەزا، ناحیە یان گەڕەکێک (هەولێر، سلێمانی، سۆران، بەغدا...)'
                  : currentLang === 'ar'
                  ? 'ابحث عن أي محافظة، قضاء، ناحية أو حي...'
                  : 'Search any city, district, or town...'
              }
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 end-0 pr-3.5 rtl:pl-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* If Search is Active */}
          {searchQuery.trim().length > 0 ? (
            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-semibold text-slate-400 px-1 mb-2">
                {currentLang === 'ku'
                  ? `ئەنجامەکانی گەڕان (${searchResults.length})`
                  : currentLang === 'ar'
                  ? `نتائج البحث (${searchResults.length})`
                  : `Search Results (${searchResults.length})`}
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  {currentLang === 'ku'
                    ? 'هیچ شوێنێک نەدۆزرایەوە بەم ناوە.'
                    : currentLang === 'ar'
                    ? 'لم يتم العثور على أي موقع بهذا الاسم.'
                    : 'No locations matched your search.'}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectByItem(item, currentLang)}
                      className="w-full text-start p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                        <div>
                          <div className="font-semibold text-sm text-slate-900 dark:text-white">
                            {currentLang === 'ku'
                              ? item.displayName.ku
                              : currentLang === 'ar'
                              ? item.displayName.ar
                              : item.displayName.en}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            <span className="capitalize">{item.type}</span> • {item.region}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-400 ${isRtl ? 'rotate-180' : ''}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Drill-Down Multi-Level Selector */
            <div className="space-y-4 pt-1">
              {/* Region Filter Chips */}
              <div className="flex items-center gap-2 pb-1 overflow-x-auto">
                {(['All', 'Kurdistan', 'Federal Iraq'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setSelectedRegionFilter(r);
                      setActiveGov(null);
                      setActiveDist(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                      selectedRegionFilter === r
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {r === 'All'
                      ? currentLang === 'ku'
                        ? 'هەموو شوێنەکان'
                        : currentLang === 'ar'
                        ? 'جميع المناطق'
                        : 'All Regions'
                      : r === 'Kurdistan'
                      ? currentLang === 'ku'
                        ? 'هەرێمی کوردستان'
                        : currentLang === 'ar'
                        ? 'إقليم كوردستان'
                        : 'Kurdistan Region'
                      : currentLang === 'ku'
                      ? 'پارێزگاکانی تری عێراق'
                      : currentLang === 'ar'
                      ? 'محافظات العراق الأخرى'
                      : 'Federal Iraq'}
                  </button>
                ))}
              </div>

              {/* Breadcrumb Navigator */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setActiveGov(null);
                    setActiveDist(null);
                  }}
                  className={`hover:text-primary-600 transition-colors ${
                    !activeGov ? 'text-primary-600 font-bold' : ''
                  }`}
                >
                  {currentLang === 'ku' ? 'پارێزگاکان' : currentLang === 'ar' ? 'المحافظات' : 'Governorates'}
                </button>

                {activeGov && (
                  <>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRtl ? 'rotate-180' : ''}`} />
                    <button
                      onClick={() => setActiveDist(null)}
                      className={`hover:text-primary-600 transition-colors ${
                        !activeDist ? 'text-primary-600 font-bold' : ''
                      }`}
                    >
                      {getName(activeGov)}
                    </button>
                  </>
                )}

                {activeDist && (
                  <>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRtl ? 'rotate-180' : ''}`} />
                    <span className="text-primary-600 font-bold">{getName(activeDist)}</span>
                  </>
                )}
              </div>

              {/* LEVEL 1: Select Governorate */}
              {!activeGov && (
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-2 px-1">
                    {currentLang === 'ku'
                      ? 'پارێزگایەک هەڵبژێرە:'
                      : currentLang === 'ar'
                      ? 'اختر المحافظة:'
                      : 'Select Governorate:'}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredGovernorates.map((gov) => {
                      const isSelected = currentLocation.governorateId === gov.id;
                      return (
                        <div
                          key={gov.id}
                          className={`p-3 rounded-2xl border transition-all text-start flex flex-col justify-between group cursor-pointer ${
                            isSelected
                              ? 'bg-primary-50/70 dark:bg-primary-950/40 border-primary-400 dark:border-primary-600 ring-1 ring-primary-400'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-primary-300 hover:shadow-xs'
                          }`}
                          onClick={() => handleSelectGovernorate(gov)}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {getName(gov)}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-primary-600" />}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                            <span>
                              {gov.districts.length}{' '}
                              {currentLang === 'ku' ? 'قەزا' : currentLang === 'ar' ? 'أقضية' : 'districts'}
                            </span>
                            <span className="text-primary-600 font-medium group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
                              →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LEVEL 2: Select District within Governorate */}
              {activeGov && !activeDist && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-400">
                      {currentLang === 'ku'
                        ? `قەزاکانی ${getName(activeGov)}:`
                        : currentLang === 'ar'
                        ? `أقضية ${getName(activeGov)}:`
                        : `Districts of ${getName(activeGov)}:`}
                    </div>

                    {/* Quick select entire governorate */}
                    <button
                      onClick={() => handleSelectDirectGov(activeGov)}
                      className="text-xs font-bold text-primary-600 hover:underline"
                    >
                      {currentLang === 'ku'
                        ? `دیاریکردنی هەموو ${getName(activeGov)}`
                        : currentLang === 'ar'
                        ? `اختيار كل ${getName(activeGov)}`
                        : `Select Entire ${getName(activeGov)}`}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {activeGov.districts.map((dist) => {
                      const isDistSelected =
                        currentLocation.governorateId === activeGov.id &&
                        currentLocation.districtId === dist.id;
                      return (
                        <div
                          key={dist.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                            isDistSelected
                              ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-400'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-300'
                          }`}
                          onClick={() => handleSelectDistrict(dist)}
                        >
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white">
                              {getName(dist)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {dist.subDistricts.length}{' '}
                              {currentLang === 'ku'
                                ? 'ناحیە و ناوچە'
                                : currentLang === 'ar'
                                ? 'نواحي ومناطق'
                                : 'sub-districts'}
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-slate-400 ${isRtl ? 'rotate-180' : ''}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LEVEL 3: Select Sub-district within District */}
              {activeGov && activeDist && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-400">
                      {currentLang === 'ku'
                        ? `ناحیەکانی ${getName(activeDist)} (${getName(activeGov)}):`
                        : currentLang === 'ar'
                        ? `نواحي ${getName(activeDist)}:`
                        : `Sub-districts of ${getName(activeDist)}:`}
                    </div>

                    {/* Quick select entire district */}
                    <button
                      onClick={() => handleSelectDirectDist(activeDist)}
                      className="text-xs font-bold text-primary-600 hover:underline"
                    >
                      {currentLang === 'ku'
                        ? `دیاریکردنی ${getName(activeDist)}`
                        : currentLang === 'ar'
                        ? `اختيار ${getName(activeDist)}`
                        : `Select ${getName(activeDist)}`}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {activeDist.subDistricts.map((sub) => {
                      const isSubSelected =
                        currentLocation.governorateId === activeGov.id &&
                        currentLocation.districtId === activeDist.id &&
                        currentLocation.subDistrictId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSelectSubDistrict(sub)}
                          className={`p-3 rounded-2xl border text-start transition-all flex items-center justify-between ${
                            isSubSelected
                              ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 font-bold text-primary-700 dark:text-primary-300'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-400 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary-500" />
                            <span className="text-sm">{getName(sub)}</span>
                          </div>
                          {isSubSelected && <Check className="w-4 h-4 text-primary-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {currentLang === 'ku' ? 'شوێنی ئێستا:' : currentLang === 'ar' ? 'الموقع المحدد:' : 'Selected:'}
            </span>{' '}
            {currentLocation.displayLabel}
          </div>
          <button
            onClick={closeModal}
            className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-sm transition-colors"
          >
            {currentLang === 'ku' ? 'پەسەندکردن' : currentLang === 'ar' ? 'تأكيد' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
