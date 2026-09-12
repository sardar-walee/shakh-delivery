import { create } from 'zustand';
import { ALL_GOVERNORATES, FlatLocationItem, getAllFlattenedLocations } from '../data/locations';

export interface LocationSelection {
  governorateId: string;
  governorateName: string;
  districtId?: string;
  districtName?: string;
  subDistrictId?: string;
  subDistrictName?: string;
  displayLabel: string;
  latitude: number;
  longitude: number;
  isGps?: boolean;
}

interface LocationStoreState {
  currentLocation: LocationSelection;
  isModalOpen: boolean;
  hasPromptedOnEntry: boolean;
  gpsLoading: boolean;
  gpsError: string | null;

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setLocation: (loc: LocationSelection) => void;
  setHasPromptedOnEntry: (prompted: boolean) => void;
  selectByItem: (item: FlatLocationItem, lang?: string) => void;
  requestGpsLocation: (lang?: string) => Promise<boolean>;
}

const DEFAULT_LOCATION: LocationSelection = {
  governorateId: 'erbil',
  governorateName: 'Erbil',
  districtId: 'erbil-center',
  districtName: 'Erbil Center',
  displayLabel: 'Erbil, KR',
  latitude: 36.1911,
  longitude: 44.0092,
  isGps: false,
};

export const useLocationStore = create<LocationStoreState>((set, get) => {
  // Load initial from localStorage if available
  let initialLocation = DEFAULT_LOCATION;
  const saved = localStorage.getItem('shakh_selected_location');
  if (saved) {
    try {
      initialLocation = JSON.parse(saved);
    } catch {
      initialLocation = DEFAULT_LOCATION;
    }
  }

  // Check if location was explicitly selected before
  const hasEverChosen = localStorage.getItem('shakh_location_chosen') === 'true';

  return {
    currentLocation: initialLocation,
    isModalOpen: false,
    hasPromptedOnEntry: hasEverChosen,
    gpsLoading: false,
    gpsError: null,

    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),

    setLocation: (loc: LocationSelection) => {
      localStorage.setItem('shakh_selected_location', JSON.stringify(loc));
      localStorage.setItem('shakh_location_chosen', 'true');
      set({ currentLocation: loc, isModalOpen: false, hasPromptedOnEntry: true });
    },

    setHasPromptedOnEntry: (prompted: boolean) => {
      set({ hasPromptedOnEntry: prompted });
    },

    selectByItem: (item: FlatLocationItem, lang = 'ku') => {
      const getLabel = (l: string) => {
        if (l === 'ku') return item.displayName.ku;
        if (l === 'ar') return item.displayName.ar;
        return item.displayName.en;
      };

      const getGovName = (l: string) => {
        if (l === 'ku') return item.governorateName.ku;
        if (l === 'ar') return item.governorateName.ar;
        return item.governorateName.en;
      };

      const getDistName = (l: string) => {
        if (!item.districtName) return undefined;
        if (l === 'ku') return item.districtName.ku;
        if (l === 'ar') return item.districtName.ar;
        return item.districtName.en;
      };

      const getSubName = (l: string) => {
        if (!item.subDistrictName) return undefined;
        if (l === 'ku') return item.subDistrictName.ku;
        if (l === 'ar') return item.subDistrictName.ar;
        return item.subDistrictName.en;
      };

      const newLoc: LocationSelection = {
        governorateId: item.governorateId,
        governorateName: getGovName(lang),
        districtId: item.districtId,
        districtName: getDistName(lang),
        subDistrictId: item.subDistrictId,
        subDistrictName: getSubName(lang),
        displayLabel: getLabel(lang),
        latitude: item.latitude,
        longitude: item.longitude,
        isGps: false,
      };

      get().setLocation(newLoc);
    },

    requestGpsLocation: async (lang = 'ku') => {
      if (!navigator.geolocation) {
        set({ gpsError: 'GPS is not supported' });
        return false;
      }

      set({ gpsLoading: true, gpsError: null });

      return new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Find closest governorate or district
            let closest = ALL_GOVERNORATES[0];
            let minDistance = Infinity;

            for (const gov of ALL_GOVERNORATES) {
              const dLat = ((gov.latitude - latitude) * Math.PI) / 180;
              const dLon = ((gov.longitude - longitude) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((latitude * Math.PI) / 180) *
                  Math.cos((gov.latitude * Math.PI) / 180) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

              if (dist < minDistance) {
                minDistance = dist;
                closest = gov;
              }
            }

            const govLabel =
              lang === 'ku'
                ? closest.nameKu
                : lang === 'ar'
                ? closest.nameAr
                : closest.nameEn;

            const loc: LocationSelection = {
              governorateId: closest.id,
              governorateName: govLabel,
              displayLabel:
                lang === 'ku'
                  ? `${govLabel} (شوێنی ڕاستەقینە - GPS)`
                  : lang === 'ar'
                  ? `${govLabel} (الموقع الحالي - GPS)`
                  : `${closest.nameEn} (Current GPS)`,
              latitude,
              longitude,
              isGps: true,
            };

            get().setLocation(loc);
            set({ gpsLoading: false, gpsError: null });
            resolve(true);
          },
          (err) => {
            set({
              gpsLoading: false,
              gpsError:
                err.code === 1
                  ? 'دەسەڵاتی دیاریکردنی شوێن پێنەدراوە / Permission denied'
                  : 'نەتوانرا شوێن بدۆزرێتەوە / Unable to retrieve GPS',
            });
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      });
    },
  };
});
