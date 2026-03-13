import { create } from 'zustand';
import { defaultCountryId } from './cityPicker.data';

export interface CityPickerStoreState {
    query: string;
    selectedCountryId: number;
    selectedDistrictId: number | null;
    selectedRegionId: number | null;
    showCountryPicker: boolean;
    setQuery: (query: string) => void;
    clearQuery: () => void;
    toggleCountryPicker: () => void;
    selectCountry: (countryId: number) => void;
    selectDistrict: (districtId: number) => void;
    selectRegion: (regionId: number) => void;
    resetState: () => void;
}

const initialStoreState = {
    query: '',
    selectedCountryId: defaultCountryId,
    selectedDistrictId: null,
    selectedRegionId: null,
    showCountryPicker: false,
};

export const useCityPickerStore = create<CityPickerStoreState>((set) => ({
    ...initialStoreState,
    setQuery: (query) => set({ query }),
    clearQuery: () => set({ query: '' }),
    toggleCountryPicker: () => set((state) => ({ showCountryPicker: !state.showCountryPicker })),
    selectCountry: (countryId) => set({
        selectedCountryId: countryId,
        selectedDistrictId: null,
        selectedRegionId: null,
        showCountryPicker: false,
        query: '',
    }),
    selectDistrict: (districtId) => set({
        selectedDistrictId: districtId,
        selectedRegionId: null,
    }),
    selectRegion: (regionId) => set({ selectedRegionId: regionId }),
    resetState: () => set(initialStoreState),
}));