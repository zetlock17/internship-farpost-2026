import {
    memo,
    useState,
    useMemo,
    useCallback,
    type ChangeEvent,
    type RefObject,
} from 'react';
import CitySelector from './CitySelector';
import searchIconSrc from '../assets/search.svg';
import arrowLeftIconSrc from '../assets/arrowCountry.svg';
import crossIconSrc from '../assets/cross.svg';
import crossIconMobileSrc from '../assets/crossCloseMobile.svg';
import { useMobileBackGesture } from '../hooks/useMobileBackGesture';
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
                <CitySelector
                    key={city.cityId}
                    cityName={city.cityName}
                    regionName={city.regionName}
                    displayMode="search-result"
                    variant={variant}
                    bold={city.count > 30000}
                    onClick={() => onSelect(city)}
                    className="w-full"
                />
            ))}
        </div>
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
                        <CitySelector
                            key={city.id}
                            cityName={city.name}
                            regionName={regionName}
                            displayMode="default"
                            variant={variant}
                            bold={(city.count ?? 0) > 30000}
                            selected={selectedCityId === city.id}
                            onClick={() => onSelect(city)}
                            className="w-full"
                        />
                    ))}
                </div>
            )}

            {popularCities.length > 0 && <hr className="border-[#EEE] mb-3" />}

            {cityGroups.map(([letter, letterCities]) => (
                <div key={letter} className="flex flex-col gap-0.5 mb-1">
                    {letterCities.map((city, index) => (
                        <CitySelector
                            key={city.id}
                            cityName={city.name}
                            regionName={regionName}
                            showFirstLetter={index === 0}
                            displayMode="default"
                            variant={variant}
                            bold={(city.count ?? 0) > 30000}
                            selected={selectedCityId === city.id}
                            onClick={() => onSelect(city)}
                            className="w-full"
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

    const { syncHistoryEntryBeforeClose, closeWithHistorySync } = useMobileBackGesture<MobileStep>({
        currentStep: mobileStep,
        isSearching,
        isRootStep: (step) => step === 'countries',
        onStepBack: (currentStep) => {
            setMobileStepOverride((nextStep) => getPreviousMobileStep(nextStep ?? currentStep));
        },
        onClose,
        historyStateKey: MOBILE_MODAL_HISTORY_STATE_KEY,
    });

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
                            <CitySelector
                                key={country.id}
                                cityName={country.name}
                                variant="mobile"
                                displayMode="default"
                                selected={selectedCountryId === country.id}
                                onClick={() => handleMobileCountrySelect(country.id)}
                                className="w-full"
                            />
                        ))}
                    </div>
                ) : mobileStep === 'districts' ? (
                    <>
                        <MobileBackButton onClick={handleMobileBack} />
                        <div className="flex flex-col">
                            {districts.map((district) => (
                                <CitySelector
                                    key={district.id}
                                    cityName={district.name}
                                    variant="mobile"
                                    displayMode="default"
                                    selected={selectedMobileDistrictId === district.id}
                                    onClick={() => handleMobileDistrictSelect(district.id)}
                                    className="w-full"
                                />
                            ))}
                        </div>
                    </>
                ) : mobileStep === 'regions' ? (
                    <>
                        <MobileBackButton onClick={handleMobileBack} />
                        <div className="flex flex-col">
                            {mobileRegionsForSelectedDistrict.map((region) => (
                                <CitySelector
                                    key={region.id}
                                    cityName={region.name}
                                    variant="mobile"
                                    displayMode="default"
                                    selected={selectedRegion?.id === region.id}
                                    onClick={() => handleMobileRegionSelect(region.id)}
                                    className="w-full"
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
