import {
    memo,
    useCallback,
    useRef,
    useEffect,
    useEffectEvent,
    type ChangeEvent,
} from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useShallow } from 'zustand/react/shallow';
import CityPickerModalMobile from './CityPickerModalMobile';
import { CityPickerHeader } from './CityPickerHeader';
import { CountryBreadcrumb } from './CountryBreadcrumb';
import { CountryPickerDialog } from './CountryPickerDialog';
import { SelectionColumn } from './SelectionColumn';
import { SearchResultsList } from './SearchResultsList';
import { RegionCitiesList } from './RegionCitiesList';
import { EmptyPickerState } from './EmptyPickerState';
import {
    useCityPickerDerivedData,
    type GeoNode,
    type SearchCity,
    type SelectedCity,
} from '../stores/cityPicker.data';
import { useCityPickerStore } from '../stores/cityPicker.store';

export type { SelectedCity } from '../stores/cityPicker.data';

interface CityPickerModalProps {
    onSelect: (city: SelectedCity) => void;
    onClose: () => void;
    currentCity?: SelectedCity | null;
}

const EMPTY_SEARCH_RESULTS: SearchCity[] = [];

export const CityPickerModal = memo(function CityPickerModal({
    onSelect,
    onClose,
    currentCity,
}: CityPickerModalProps) {
    const isMobile = useIsMobile();
    const inputRef = useRef<HTMLInputElement>(null);
    const hasInitializedFromCurrentCityRef = useRef(false);

    const {
        query,
        selectedCountryId,
        selectedDistrictId,
        selectedRegionId,
        showCountryPicker,
        setQuery,
        clearQuery,
        toggleCountryPicker,
        selectCountry,
        selectDistrict,
        selectRegion,
        resetState,
    } = useCityPickerStore(useShallow((state) => ({
        query: state.query,
        selectedCountryId: state.selectedCountryId,
        selectedDistrictId: state.selectedDistrictId,
        selectedRegionId: state.selectedRegionId,
        showCountryPicker: state.showCountryPicker,
        setQuery: state.setQuery,
        clearQuery: state.clearQuery,
        toggleCountryPicker: state.toggleCountryPicker,
        selectCountry: state.selectCountry,
        selectDistrict: state.selectDistrict,
        selectRegion: state.selectRegion,
        resetState: state.resetState,
    })));

    const {
        primaryCountry,
        secondaryCountries,
        selectedCountry,
        selectedDistrict,
        selectedRegion,
        districts,
        regions,
        searchResults,
        isSearching,
        popularCities,
        cityGroups,
        resolveCityPath,
    } = useCityPickerDerivedData({
        query,
        selectedCountryId,
        selectedDistrictId,
        selectedRegionId,
    });

    useEffect(() => {
        if (selectedCountryId === 0 && primaryCountry.id !== 0) {
            selectCountry(primaryCountry.id);
        }
    }, [primaryCountry.id, selectCountry, selectedCountryId]);

    useEffect(() => {
        if (hasInitializedFromCurrentCityRef.current) {
            return;
        }

        const cityPath = resolveCityPath(currentCity?.cityId);
        if (!cityPath) {
            return;
        }

        selectCountry(cityPath.countryId);
        selectDistrict(cityPath.districtId);
        selectRegion(cityPath.regionId);
        hasInitializedFromCurrentCityRef.current = true;
    }, [
        currentCity?.cityId,
        resolveCityPath,
        selectCountry,
        selectDistrict,
        selectRegion,
    ]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleClose = useCallback(() => {
        resetState();
        onClose();
    }, [onClose, resetState]);

    const onWindowKeyDown = useEffectEvent((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            handleClose();
        }
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            onWindowKeyDown(event);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleQueryChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    }, [setQuery]);

    const handleClearQuery = useCallback(() => {
        clearQuery();
        inputRef.current?.focus();
    }, [clearQuery]);

    const commitCitySelection = useCallback((city: SelectedCity) => {
        onSelect(city);
        handleClose();
    }, [handleClose, onSelect]);

    const handleSearchResultSelect = useCallback((city: SearchCity) => {
        commitCitySelection(city);
    }, [commitCitySelection]);

    const handleRegionCitySelect = useCallback((city: GeoNode) => {
        if (!selectedRegion) {
            return;
        }

        commitCitySelection({
            cityId: city.id,
            cityName: city.name,
            regionName: selectedRegion.name,
            countryName: selectedCountry.name,
        });
    }, [commitCitySelection, selectedCountry.name, selectedRegion]);

    if (isMobile) {
        return (
            <CityPickerModalMobile
                query={query}
                inputRef={inputRef}
                onQueryChange={handleQueryChange}
                onClearQuery={handleClearQuery}
                onClose={handleClose}
                currentCityName={currentCity?.cityName}
                selectedCityId={currentCity?.cityId}
                selectedCountryId={selectedCountryId}
                primaryCountry={primaryCountry}
                secondaryCountries={secondaryCountries}
                districts={districts}
                selectedDistrictId={selectedDistrictId}
                selectedRegion={selectedRegion}
                popularCities={popularCities}
                cityGroups={cityGroups}
                searchResults={searchResults}
                isSearching={isSearching}
                onSelectCountry={selectCountry}
                onSelectDistrict={selectDistrict}
                onSelectRegion={selectRegion}
                onSelectSearchResult={handleSearchResultSelect}
                onSelectRegionCity={handleRegionCitySelect}
            />
        );
    }

    if (showCountryPicker) {
        return (
            <CountryPickerDialog
                primaryCountry={primaryCountry}
                secondaryCountries={secondaryCountries}
                selectedCountryId={selectedCountryId}
                onClose={handleClose}
                onSelectCountry={selectCountry}
            />
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl flex flex-col w-240 h-161"
                onClick={(event) => event.stopPropagation()}
            >
                <CityPickerHeader
                    query={query}
                    inputRef={inputRef}
                    onQueryChange={handleQueryChange}
                    onClearQuery={handleClearQuery}
                />

                <div className="flex flex-1 overflow-hidden gap-5">
                    <div className="w-60 shrink-0 flex flex-col gap-3 overflow-y-auto scrollbar-hidden p-5">
                        <CountryBreadcrumb
                            countryName={selectedCountry.name}
                            onToggleCountryPicker={toggleCountryPicker}
                        />
                        <SelectionColumn
                            items={districts}
                            activeId={selectedDistrict?.id ?? null}
                            onSelect={selectDistrict}
                            emptyText="Нет округов"
                        />
                    </div>

                    {!selectedDistrict && !isSearching ? (
                        <EmptyPickerState />
                    ) : (
                        <>
                            <div className="w-76 shrink-0 flex flex-col gap-2.5 overflow-y-auto scrollbar-hidden py-5">
                                <SelectionColumn
                                    items={regions}
                                    activeId={selectedRegion?.id ?? null}
                                    onSelect={selectRegion}
                                />
                            </div>

                            <div className="w-94 shrink-0 overflow-y-auto scrollbar-hidden p-5">
                                {isSearching ? (
                                    <SearchResultsList
                                        results={searchResults ?? EMPTY_SEARCH_RESULTS}
                                        onSelect={handleSearchResultSelect}
                                    />
                                ) : selectedRegion ? (
                                    <RegionCitiesList
                                        regionName={selectedRegion.name}
                                        popularCities={popularCities}
                                        cityGroups={cityGroups}
                                        onSelect={handleRegionCitySelect}
                                        selectedCityId={currentCity?.cityId}
                                    />
                                ) : null}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

export default CityPickerModal;
