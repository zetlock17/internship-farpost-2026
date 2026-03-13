import {
    memo,
    useCallback,
    useRef,
    useEffect,
    useEffectEvent,
    type ChangeEvent,
    type RefObject,
} from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useShallow } from 'zustand/react/shallow';
import CitySelector from './CitySelector';
import CityPickerModalMobile from './CityPickerModalMobile';
import searchIconSrc from '../assets/search.svg';
import arrowLeftIconSrc from '../assets/arrowCountry.svg';
import arrowRightIconSrc from '../assets/arrow.svg';
import crossIconSrc from '../assets/cross.svg';
import searchBGSrc from '../assets/searchBG.svg';
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

const cn = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' ');

interface ColumnItemProps {
    itemId: number;
    label: string;
    active?: boolean;
    onSelect: (itemId: number) => void;
    showArrow?: boolean;
}

const ColumnItem = memo(function ColumnItem({
    itemId,
    label,
    active,
    onSelect,
    showArrow,
}: ColumnItemProps) {
    const handleClick = useCallback(() => {
        onSelect(itemId);
    }, [itemId, onSelect]);

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-100 flex items-center justify-between gap-3',
                active
                    ? 'bg-[#FFEFBA] text-[#4A4A4A] font-medium'
                    : 'text-[#0052C2] hover:bg-[#F4F9FC]',
            )}
        >
            <span>{label}</span>
            {showArrow && <img src={arrowRightIconSrc} width="9" height="14" aria-hidden="true" alt="" />}
        </button>
    );
});

interface SelectionColumnProps {
    items: GeoNode[];
    activeId: number | null;
    onSelect: (itemId: number) => void;
    emptyText?: string;
}

const SelectionColumn = memo(function SelectionColumn({
    items,
    activeId,
    onSelect,
    emptyText,
}: SelectionColumnProps) {
    if (items.length === 0 && emptyText) {
        return <p className="text-[#999] text-sm px-2">{emptyText}</p>;
    }

    return (
        <>
            {items.map((item) => (
                <ColumnItem
                    key={item.id}
                    itemId={item.id}
                    label={item.name}
                    active={activeId === item.id}
                    showArrow={activeId === item.id}
                    onSelect={onSelect}
                />
            ))}
        </>
    );
});

interface CityPickerHeaderProps {
    query: string;
    inputRef: RefObject<HTMLInputElement | null>;
    onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onClearQuery: () => void;
}

const CityPickerHeader = memo(function CityPickerHeader({
    query,
    inputRef,
    onQueryChange,
    onClearQuery,
}: CityPickerHeaderProps) {
    return (
        <div className="flex items-center justify-between p-5 gap-9 h-19 shrink-0">
            <h2 className="text-xl font-normal text-[#222] w-126 h-7 px-3">Выбор города</h2>
            <div className="relative">
                {!query && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <img src={searchIconSrc} aria-hidden="true" alt="" />
                    </span>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={onQueryChange}
                    placeholder="Название города"
                    className={cn(
                        'w-92 h-9 rounded border border-[#DDD] text-sm text-[#222] placeholder:text-[#999] outline-none focus:border-[#0099FF] py-1.5',
                        query ? 'pl-3 pr-10' : 'pl-8.5 pr-2',
                    )}
                />
                {query && (
                    <button
                        type="button"
                        onClick={onClearQuery}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center"
                        aria-label="Очистить поиск"
                    >
                        <img src={crossIconSrc} aria-hidden="true" alt="" />
                    </button>
                )}
            </div>
        </div>
    );
});


interface CountryBreadcrumbProps {
    countryName: string;
    onToggleCountryPicker: () => void;
}

const CountryBreadcrumb = memo(function CountryBreadcrumb({
    countryName,
    onToggleCountryPicker,
}: CountryBreadcrumbProps) {
    return (
        <div className="flex items-center justify-between text-sm select-none">
            <button
                type="button"
                onClick={onToggleCountryPicker}
                className="flex items-center gap-1 text-[#0052C2] hover:underline py-3 pr-3 pl-1"
                aria-label="Выбрать страну"
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    <img src={arrowLeftIconSrc} aria-hidden="true" alt="" />
                </div>
                <span>страны</span>
            </button>
            <span className="text-[#999]">|</span>
            <div className="p-3">
                <span className="text-[#4A4A4A] font-normal">{countryName}</span>
            </div>
        </div>
    );
});

interface CountryPickerDialogProps {
    primaryCountry: GeoNode;
    secondaryCountries: GeoNode[];
    selectedCountryId: number;
    onClose: () => void;
    onSelectCountry: (countryId: number) => void;
}

const CountryPickerDialog = memo(function CountryPickerDialog({
    primaryCountry,
    secondaryCountries,
    selectedCountryId,
    onClose,
    onSelectCountry,
}: CountryPickerDialogProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-120 max-h-[80vh] overflow-y-auto p-8"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-[#222] mb-6">Выбор страны</h2>
                <div className="flex flex-col gap-1">
                    <ColumnItem
                        itemId={primaryCountry.id}
                        label={primaryCountry.name}
                        active={selectedCountryId === primaryCountry.id}
                        onSelect={onSelectCountry}
                    />
                    {secondaryCountries.map((country) => (
                        <ColumnItem
                            key={country.id}
                            itemId={country.id}
                            label={country.name}
                            active={selectedCountryId === country.id}
                            onSelect={onSelectCountry}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

interface SearchResultItemProps {
    city: SearchCity;
    onSelect: (city: SearchCity) => void;
    variant?: 'desktop' | 'mobile';
}

const SearchResultItem = memo(function SearchResultItem({ city, onSelect, variant = 'desktop' }: SearchResultItemProps) {
    const handleClick = useCallback(() => {
        onSelect(city);
    }, [city, onSelect]);

    return (
        <CitySelector
            cityName={city.cityName}
            regionName={city.regionName}
            displayMode="search-result"
            variant={variant}
            bold={city.count > 30000}
            onClick={handleClick}
            className="w-full"
        />
    );
});

interface SearchResultsListProps {
    results: SearchCity[];
    onSelect: (city: SearchCity) => void;
    variant?: 'desktop' | 'mobile';
}

const SearchResultsList = memo(function SearchResultsList({ results, onSelect, variant = 'desktop' }: SearchResultsListProps) {
    if (results.length === 0) {
        return <p className="text-[#999] text-sm mt-4">Города не найдены</p>;
    }

    return (
        <div className="flex flex-col gap-3">
            {results.map((city) => (
                <SearchResultItem key={city.cityId} city={city} onSelect={onSelect} variant={variant} />
            ))}
        </div>
    );
});

interface RegionCityItemProps {
    city: GeoNode;
    regionName: string;
    showFirstLetter?: boolean;
    onSelect: (city: GeoNode) => void;
    variant?: 'desktop' | 'mobile';
    selectedCityId?: number | null;
}

const RegionCityItem = memo(function RegionCityItem({
    city,
    regionName,
    showFirstLetter,
    onSelect,
    variant = 'desktop',
    selectedCityId,
}: RegionCityItemProps) {
    const handleClick = useCallback(() => {
        onSelect(city);
    }, [city, onSelect]);

    return (
        <CitySelector
            cityName={city.name}
            regionName={regionName}
            showFirstLetter={showFirstLetter}
            displayMode="default"
            variant={variant}
            bold={(city.count ?? 0) > 30000}
            selected={selectedCityId === city.id}
            onClick={handleClick}
            className="w-full"
        />
    );
});

interface RegionCitiesListProps {
    regionName: string;
    popularCities: GeoNode[];
    cityGroups: Array<[string, GeoNode[]]>;
    onSelect: (city: GeoNode) => void;
    variant?: 'desktop' | 'mobile';
    selectedCityId?: number | null;
}

const RegionCitiesList = memo(function RegionCitiesList({
    regionName,
    popularCities,
    cityGroups,
    onSelect,
    variant = 'desktop',
    selectedCityId,
}: RegionCitiesListProps) {
    return (
        <>
            {popularCities.length > 0 && (
                <div className="flex flex-col mb-5">
                    {popularCities.map((city) => (
                        <RegionCityItem
                            key={city.id}
                            city={city}
                            regionName={regionName}
                            onSelect={onSelect}
                            variant={variant}
                            selectedCityId={selectedCityId}
                        />
                    ))}
                </div>
            )}

            {popularCities.length > 0 && <hr className="border-[#EEE] mb-3" />}

            {cityGroups.map(([letter, letterCities]) => (
                <div key={letter} className="flex flex-col gap-0.5 mb-1">
                    {letterCities.map((city, index) => (
                        <RegionCityItem
                            key={city.id}
                            city={city}
                            regionName={regionName}
                            showFirstLetter={index === 0}
                            onSelect={onSelect}
                            variant={variant}
                            selectedCityId={selectedCityId}
                        />
                    ))}
                </div>
            ))}
        </>
    );
});

const EmptyPickerState = memo(function EmptyPickerState() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <img src={searchBGSrc} width="205" height="194" aria-hidden="true" alt="" />
        </div>
    );
});

export const CityPickerModal = memo(function CityPickerModal({
    onSelect,
    onClose,
    currentCity,
}: CityPickerModalProps) {
    const isMobile = useIsMobile();
    const inputRef = useRef<HTMLInputElement>(null);

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
    } = useCityPickerDerivedData({
        query,
        selectedCountryId,
        selectedDistrictId,
        selectedRegionId,
    });

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
                primaryCountry={primaryCountry}
                secondaryCountries={secondaryCountries}
                districts={districts}
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

                <div className="flex flex-1 overflow-hidden gap-9">
                    <div className="w-60 shrink-0 flex flex-col gap-3 overflow-y-auto p-5">
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
                            <div className="w-76 shrink-0 flex flex-col gap-2.5 overflow-y-auto py-5">
                                <SelectionColumn
                                    items={regions}
                                    activeId={selectedRegion?.id ?? null}
                                    onSelect={selectRegion}
                                />
                            </div>

                            <div className="w-94 shrink-0 overflow-y-auto p-5">
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
