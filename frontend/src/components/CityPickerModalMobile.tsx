import {
    memo,
    useState,
    useMemo,
    useCallback,
    useEffect,
    useRef,
    type ChangeEvent,
    type RefObject,
} from 'react';
import CitySelector from './CitySelector';
import searchIconSrc from '../assets/search.svg';
import arrowLeftIconSrc from '../assets/arrowCountry.svg';
import crossIconSrc from '../assets/cross.svg';
import crossIconMobileSrc from '../assets/crossCloseMobile.svg';
import {
    type GeoNode,
    type SearchCity,
} from '../stores/cityPicker.data';

const EMPTY_SEARCH_RESULTS: SearchCity[] = [];

const MOBILE_MODAL_HISTORY_STATE_KEY = 'cityPickerMobileModal';

const getPreviousMobileStep = (step: MobileStep): MobileStep => {
    if (step === 'cities') {
        return 'regions';
    }
    if (step === 'regions') {
        return 'districts';
    }

    return 'countries';
};

type MobileStep = 'countries' | 'districts' | 'regions' | 'cities';

type Variant = 'desktop' | 'mobile';

interface SearchResultItemProps {
    city: SearchCity;
    onSelect: (city: SearchCity) => void;
    variant?: Variant;
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
    variant?: Variant;
}

const SearchResultsList = memo(function SearchResultsList({ results, onSelect, variant = 'desktop' }: SearchResultsListProps) {
    if (results.length === 0) {
        return <p className="text-[#999] text-sm mt-4 text-center">Города не найдены</p>;
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
    variant?: Variant;
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

interface CountryItemProps {
    country: GeoNode;
    onSelect: (countryId: number) => void;
    selectedCountryId: number;
}

const CountryItem = memo(function CountryItem({ country, onSelect, selectedCountryId }: CountryItemProps) {
    const handleClick = useCallback(() => {
        onSelect(country.id);
    }, [country.id, onSelect]);

    return (
        <CitySelector
            cityName={country.name}
            variant="mobile"
            displayMode="default"
            selected={selectedCountryId === country.id}
            onClick={handleClick}
            className="w-full"
        />
    );
});

interface MobileRegionItemProps {
    region: GeoNode;
    onSelect: (regionId: number) => void;
    selected?: boolean;
}

const MobileRegionItem = memo(function MobileRegionItem({ region, onSelect, selected = false }: MobileRegionItemProps) {
    const handleClick = useCallback(() => {
        onSelect(region.id);
    }, [region.id, onSelect]);

    return (
        <CitySelector
            cityName={region.name}
            variant="mobile"
            displayMode="default"
            selected={selected}
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
    variant?: Variant;
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

interface MobileCityPickerHeaderProps {
    query: string;
    inputRef: RefObject<HTMLInputElement | null>;
    onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onClearQuery: () => void;
    onClose: () => void;
    currentCityName?: string;
}

const MobileCityPickerHeader = memo(function MobileCityPickerHeader({
    query,
    inputRef,
    onQueryChange,
    onClearQuery,
    onClose,
    currentCityName,
}: MobileCityPickerHeaderProps) {
    return (
        <div className="shrink-0">
            <div className="flex items-center justify-between py-2 px-3 gap-3">
                <h2 className="text-[19px] font-bold text-[#1D1D20]">Выбор города</h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F4F9FC]"
                    aria-label="Закрыть"
                >
                    <img src={crossIconMobileSrc} aria-hidden="true" alt="" />
                </button>
            </div>
            <div className='pt-5 pb-2 px-3 gap-2 flex flex-col'>
                <div
                    className={`h-9 rounded border border-[#DDD] focus-within:border-[#0099FF] flex items-center gap-1 py-1.5 ${query ? 'pl-3 pr-2' : 'pl-2 pr-3'}`}
                >
                    {!query && (
                        <div className="w-6 h-6 flex items-center justify-center pointer-events-none shrink-0">
                            <img src={searchIconSrc} aria-hidden="true" alt="" />
                        </div>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={onQueryChange}
                        placeholder="Название города"
                        className="flex-1 h-6 leading-6 bg-transparent text-[16px] text-[#222] placeholder:text-[#999] outline-none relative top-px"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={onClearQuery}
                            className="w-6 h-6 flex items-center justify-center shrink-0"
                            aria-label="Очистить поиск"
                        >
                            <img src={crossIconSrc} aria-hidden="true" alt="" />
                        </button>
                    )}
                </div>
                {currentCityName && (
                    <p className="text-sm text-[#999] px-0.5">сейчас, {currentCityName}</p>
                )}
            </div>
        </div>
    );
});

const MobileBackButton = memo(function MobileBackButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-1 pl-3 py-3 pr-3 text-[#0052C2] text-[16px] hover:underline"
            aria-label="Назад"
        >
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <img src={arrowLeftIconSrc} aria-hidden="true" alt="" />
            </div>
            <span className="leading-none relative top-px">Назад</span>
        </button>
    );
});

interface CityPickerModalMobileProps {
    query: string;
    inputRef: RefObject<HTMLInputElement | null>;
    onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onClearQuery: () => void;
    onClose: () => void;
    currentCityName?: string;
    selectedCityId?: number | null;
    selectedCountryId: number;
    primaryCountry: GeoNode;
    secondaryCountries: GeoNode[];
    districts: GeoNode[];
    selectedDistrictId: number | null;
    selectedRegion: GeoNode | null;
    popularCities: GeoNode[];
    cityGroups: Array<[string, GeoNode[]]>;
    searchResults: SearchCity[] | null;
    isSearching: boolean;
    onSelectCountry: (countryId: number) => void;
    onSelectDistrict: (districtId: number) => void;
    onSelectRegion: (regionId: number) => void;
    onSelectSearchResult: (city: SearchCity) => void;
    onSelectRegionCity: (city: GeoNode) => void;
}

export const CityPickerModalMobile = memo(function CityPickerModalMobile({
    query,
    inputRef,
    onQueryChange,
    onClearQuery,
    onClose,
    currentCityName,
    selectedCityId,
    selectedCountryId,
    primaryCountry,
    secondaryCountries,
    districts,
    selectedDistrictId,
    selectedRegion,
    popularCities,
    cityGroups,
    searchResults,
    isSearching,
    onSelectCountry,
    onSelectDistrict,
    onSelectRegion,
    onSelectSearchResult,
    onSelectRegionCity,
}: CityPickerModalMobileProps) {
    const [mobileStepOverride, setMobileStepOverride] = useState<MobileStep | null>(null);
    const [selectedMobileDistrictIdState, setSelectedMobileDistrictIdState] = useState<number | null>(null);
    const hasModalHistoryEntryRef = useRef(false);
    const shouldIgnoreNextPopStateRef = useRef(false);
    const mobileStepRef = useRef<MobileStep>('countries');
    const isSearchingRef = useRef(isSearching);
    const mobileStep = useMemo<MobileStep>(() => {
        if (mobileStepOverride !== null) {
            return mobileStepOverride;
        }

        if (selectedDistrictId === null) {
            return 'countries';
        }

        return selectedRegion ? 'cities' : 'regions';
    }, [mobileStepOverride, selectedDistrictId, selectedRegion]);
    const selectedMobileDistrictId = selectedMobileDistrictIdState ?? selectedDistrictId;

    const pushModalHistoryEntry = useCallback(() => {
        window.history.pushState(
            {
                [MOBILE_MODAL_HISTORY_STATE_KEY]: true,
            },
            '',
            window.location.href,
        );

        hasModalHistoryEntryRef.current = true;
    }, []);

    useEffect(() => {
        mobileStepRef.current = mobileStep;
    }, [mobileStep]);

    useEffect(() => {
        isSearchingRef.current = isSearching;
    }, [isSearching]);

    const mobileRegionsForSelectedDistrict = useMemo(() => {
        if (selectedMobileDistrictId === null) return [];
        const district = districts.find((d) => d.id === selectedMobileDistrictId);
        return district?.children ?? [];
    }, [districts, selectedMobileDistrictId]);

    const handleMobileCountrySelect = useCallback((countryId: number) => {
        onSelectCountry(countryId);
        setSelectedMobileDistrictIdState(null);
        setMobileStepOverride('districts');
    }, [onSelectCountry]);

    const handleMobileDistrictSelect = useCallback((districtId: number) => {
        onSelectDistrict(districtId);
        setSelectedMobileDistrictIdState(districtId);
        setMobileStepOverride('regions');
    }, [onSelectDistrict]);

    const handleMobileRegionSelect = useCallback((regionId: number) => {
        onSelectRegion(regionId);
        setMobileStepOverride('cities');
    }, [onSelectRegion]);

    const handleMobileBack = useCallback(() => {
        setMobileStepOverride((currentStep) => getPreviousMobileStep(currentStep ?? mobileStep));
    }, [mobileStep]);

    const syncHistoryEntryBeforeClose = useCallback(() => {
        if (hasModalHistoryEntryRef.current) {
            shouldIgnoreNextPopStateRef.current = true;
            hasModalHistoryEntryRef.current = false;
            window.history.back();
        }
    }, []);

    const closeWithHistorySync = useCallback(() => {
        syncHistoryEntryBeforeClose();
        onClose();
    }, [onClose, syncHistoryEntryBeforeClose]);

    useEffect(() => {
        pushModalHistoryEntry();

        const onPopState = () => {
            if (shouldIgnoreNextPopStateRef.current) {
                shouldIgnoreNextPopStateRef.current = false;
                return;
            }

            if (mobileStepRef.current === 'countries' || isSearchingRef.current) {
                hasModalHistoryEntryRef.current = false;
                onClose();
                return;
            }

            setMobileStepOverride((currentStep) => getPreviousMobileStep(currentStep ?? mobileStepRef.current));
            pushModalHistoryEntry();
        };

        window.addEventListener('popstate', onPopState);

        return () => {
            window.removeEventListener('popstate', onPopState);
        };
    }, [onClose, pushModalHistoryEntry]);

    const handleSearchResultSelectWithHistorySync = useCallback((city: SearchCity) => {
        syncHistoryEntryBeforeClose();
        onSelectSearchResult(city);
    }, [onSelectSearchResult, syncHistoryEntryBeforeClose]);

    const handleRegionCitySelectWithHistorySync = useCallback((city: GeoNode) => {
        syncHistoryEntryBeforeClose();
        onSelectRegionCity(city);
    }, [onSelectRegionCity, syncHistoryEntryBeforeClose]);

    const allCountries = [primaryCountry, ...secondaryCountries];

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            <MobileCityPickerHeader
                query={query}
                inputRef={inputRef}
                onQueryChange={onQueryChange}
                onClearQuery={onClearQuery}
                onClose={closeWithHistorySync}
                currentCityName={currentCityName}
            />
            <div className="flex-1 overflow-y-auto">
                {isSearching ? (
                    <div>
                        <SearchResultsList
                            results={searchResults ?? EMPTY_SEARCH_RESULTS}
                            onSelect={handleSearchResultSelectWithHistorySync}
                            variant="mobile"
                        />
                    </div>
                ) : mobileStep === 'countries' ? (
                    <div className="flex flex-col">
                        {allCountries.map((country) => (
                            <CountryItem
                                key={country.id}
                                country={country}
                                onSelect={handleMobileCountrySelect}
                                selectedCountryId={selectedCountryId}
                            />
                        ))}
                    </div>
                ) : mobileStep === 'districts' ? (
                    <>
                        <MobileBackButton onClick={handleMobileBack} />
                        <div className="flex flex-col">
                            {districts.map((district) => (
                                <MobileRegionItem
                                    key={district.id}
                                    region={district}
                                    onSelect={handleMobileDistrictSelect}
                                    selected={selectedMobileDistrictId === district.id}
                                />
                            ))}
                        </div>
                    </>
                ) : mobileStep === 'regions' ? (
                    <>
                        <MobileBackButton onClick={handleMobileBack} />
                        <div className="flex flex-col">
                            {mobileRegionsForSelectedDistrict.map((region) => (
                                <MobileRegionItem
                                    key={region.id}
                                    region={region}
                                    onSelect={handleMobileRegionSelect}
                                    selected={selectedRegion?.id === region.id}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <MobileBackButton onClick={handleMobileBack} />
                        <div className="pb-4 pt-1">
                            {selectedRegion ? (
                                <RegionCitiesList
                                    regionName={selectedRegion.name}
                                    popularCities={popularCities}
                                    cityGroups={cityGroups}
                                    onSelect={handleRegionCitySelectWithHistorySync}
                                    variant="mobile"
                                    selectedCityId={selectedCityId}
                                />
                            ) : null}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

export default CityPickerModalMobile;
