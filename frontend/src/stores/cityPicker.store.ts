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
    selectCountry: (countryId) => set((state) => {
        if (state.selectedCountryId === countryId) {
            return state;
        }

        return {
            selectedCountryId: countryId,
            selectedDistrictId: null,
            selectedRegionId: null,
            showCountryPicker: false,
            query: '',
        };
    }),
    selectDistrict: (districtId) => set((state) => {
        if (state.selectedDistrictId === districtId) {
            return state;
        }

        return {
            selectedDistrictId: districtId,
            selectedRegionId: null,
        };
    }),
    selectRegion: (regionId) => set((state) => {
        if (state.selectedRegionId === regionId) {
            return state;
        }

        return { selectedRegionId: regionId };
    }),
    resetState: () => set(initialStoreState),
}));