import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import geoData from '../data/geo.json';
import CitySelector from './CitySelector';
import searchIconSrc from '../assets/search.svg';
import arrowLeftIconSrc from '../assets/arrowCountry.svg';
import arrowRightIconSrc from '../assets/arrow.svg';
import crossIconSrc from '../assets/cross.svg';
import searchBGSrc from '../assets/searchBG.svg';

interface GeoNode {
    id: number;
    name: string;
    type: 'country' | 'federal_district' | 'region' | 'city';
    count?: number;
    children?: GeoNode[];
}

export interface SelectedCity {
    cityId: number;
    cityName: string;
    regionName: string;
    countryName: string;
}

interface CityPickerModalProps {
    onSelect: (city: SelectedCity) => void;
    onClose: () => void;
}

const allCountries = geoData as GeoNode[];
const russia = allCountries.find((c) => c.name === 'Россия')!;
const otherCountries = allCountries.filter((c) => c.name !== 'Россия');

interface FlatCity {
    id: number;
    name: string;
    count: number;
    regionName: string;
    districtName: string;
    countryName: string;
}

function buildFlatList(): FlatCity[] {
    const result: FlatCity[] = [];
    for (const country of allCountries) {
        if (country.children) {
            for (const district of country.children) {
                if (district.children) {
                    for (const region of district.children) {
                        if (region.children) {
                            for (const city of region.children) {
                                result.push({
                                    id: city.id,
                                    name: city.name,
                                    count: city.count ?? 0,
                                    regionName: region.name,
                                    districtName: district.name,
                                    countryName: country.name,
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    return result;
}

const flatCities = buildFlatList();

function groupByLetter(cities: GeoNode[]): Map<string, GeoNode[]> {
    const map = new Map<string, GeoNode[]>();
    for (const city of cities) {
        const letter = city.name.charAt(0).toUpperCase();
        if (!map.has(letter)) map.set(letter, []);
        map.get(letter)!.push(city);
    }
    return map;
}

function topCities(cities: GeoNode[], n = 3): GeoNode[] {
    return [...cities].sort((a, b) => (b.count ?? 0) - (a.count ?? 0)).slice(0, n);
}

const cn = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' ');

interface ColumnItemProps {
    label: string;
    active?: boolean;
    onClick: () => void;
    showArrow?: boolean;
}

const ColumnItem = memo(function ColumnItem({ label, active, onClick, showArrow }: ColumnItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
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

export const CityPickerModal = memo(function CityPickerModal({
    onSelect,
    onClose,
}: CityPickerModalProps) {
    const [query, setQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<GeoNode>(russia);
    const [selectedDistrict, setSelectedDistrict] = useState<GeoNode | null>(null);
    const [selectedRegion, setSelectedRegion] = useState<GeoNode | null>(null);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q.length < 2) return null;
        return flatCities.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 40);
    }, [query]);

    const handleSelectCity = useCallback(
        (city: GeoNode, regionName: string) => {
            onSelect({
                cityId: city.id,
                cityName: city.name,
                regionName,
                countryName: selectedCountry.name,
            });
            onClose();
        },
        [onSelect, onClose, selectedCountry.name],
    );

    const handleDistrictClick = useCallback((district: GeoNode) => {
        setSelectedDistrict(district);
        setSelectedRegion(null);
    }, []);

    const handleRegionClick = useCallback((region: GeoNode) => {
        setSelectedRegion(region);
    }, []);

    const handleCountrySelect = useCallback((country: GeoNode) => {
        setSelectedCountry(country);
        setSelectedDistrict(null);
        setSelectedRegion(null);
        setShowCountryPicker(false);
        setQuery('');
    }, []);

    const districts = selectedCountry.children ?? [];
    const regions = selectedDistrict?.children ?? [];
    const popularCities = selectedRegion ? topCities(selectedRegion.children ?? []) : [];
    const cityGroups = useMemo(
        () => groupByLetter(selectedRegion?.children ?? []),
        [selectedRegion],
    );

    const breadcrumb = (
        <div className="flex items-center justify-between text-sm select-none">
            <button
                type="button"
                onClick={() => setShowCountryPicker((v) => !v)}
                className="flex items-center gap-1 text-[#0052C2] hover:underline py-3 pr-3 pl-1"
                aria-label="Выбрать страну"
            >
                <div className='w-6 h-6 flex items-center justify-center'>
                    <img src={arrowLeftIconSrc} aria-hidden="true" alt="" />
                </div>
                <span>страны</span>
            </button>
            <span className="text-[#999]">|</span>
            <div className='p-3'>
                <span className="text-[#4A4A4A] font-normal">{selectedCountry.name}</span>
            </div>
        </div>
    );

    if (showCountryPicker) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
                <div
                    className="bg-white rounded-2xl shadow-2xl w-120 max-h-[80vh] overflow-y-auto p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold text-[#222] mb-6">Выбор страны</h2>
                    <div className="flex flex-col gap-1">
                        <ColumnItem
                            key={russia.id}
                            label={russia.name}
                            active={selectedCountry.id === russia.id}
                            onClick={() => handleCountrySelect(russia)}
                        />
                        {otherCountries.map((c) => (
                            <ColumnItem
                                key={c.id}
                                label={c.name}
                                active={selectedCountry.id === c.id}
                                onClick={() => handleCountrySelect(c)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl flex flex-col w-240 h-161"
                onClick={(e) => e.stopPropagation()}
            >
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
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Название города"
                            className={`w-92 h-9 rounded border border-[#DDD] text-sm text-[#222] placeholder:text-[#999] outline-none focus:border-[#0099FF] py-1.5 ${query ? 'pl-3 pr-10' : 'pl-8.5 pr-2'}`}
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center"
                                aria-label="Очистить поиск"
                            >
                                <img src={crossIconSrc} aria-hidden="true" alt="" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden gap-9">
                    <div className="w-60 shrink-0 flex flex-col gap-3 overflow-y-auto p-5">
                        {breadcrumb}
                        {districts.length > 0 ? (
                            districts.map((d) => (
                                <ColumnItem
                                    key={d.id}
                                    label={d.name}
                                    active={selectedDistrict?.id === d.id}
                                    showArrow={selectedDistrict?.id === d.id}
                                    onClick={() => handleDistrictClick(d)}
                                />
                            ))
                        ) : (
                            <p className="text-[#999] text-sm px-2">Нет округов</p>
                        )}
                    </div>

                    {!selectedDistrict ? (
                        <div className="flex flex-1 items-center justify-center">
                            <img src={searchBGSrc} width="205" height="194" aria-hidden="true" alt="" />
                        </div>
                    ) : (
                        <>
                    <div className="w-76 shrink-0 flex flex-col gap-2.5 overflow-y-auto py-5">
                        {regions.map((r) => (
                            <ColumnItem
                                key={r.id}
                                label={r.name}
                                active={selectedRegion?.id === r.id}
                                showArrow={selectedRegion?.id === r.id}
                                onClick={() => handleRegionClick(r)}
                            />
                        ))}
                    </div>

                    <div className="w-94 shrink-0 overflow-y-auto p-5">
                        {searchResults !== null ? (
                            searchResults.length === 0 ? (
                                <p className="text-[#999] text-sm mt-4">Города не найдены</p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {searchResults.map((city) => (
                                        <CitySelector
                                            key={city.id}
                                            cityName={city.name}
                                            regionName={city.regionName}
                                            displayMode="search-result"
                                            variant="desktop"
                                            bold={city.count > 30000}
                                            onClick={() => {
                                                onSelect({
                                                    cityId: city.id,
                                                    cityName: city.name,
                                                    regionName: city.regionName,
                                                    countryName: city.countryName,
                                                });
                                                onClose();
                                            }}
                                            className="w-full"
                                        />
                                    ))}
                                </div>
                            )
                        ) : selectedRegion && (
                            <>
                                {popularCities.length > 0 && (
                                    <div className="flex flex-col mb-5">
                                        {popularCities.map((city) => (
                                            <CitySelector
                                                key={city.id}
                                                cityName={city.name}
                                                displayMode="default"
                                                variant="desktop"
                                                bold={(city.count ?? 0) > 30000}
                                                onClick={() => handleSelectCity(city, selectedRegion.name)}
                                                className="w-full"
                                            />
                                        ))}
                                    </div>
                                )}

                                {popularCities.length > 0 && <hr className="border-[#EEE] mb-3" />}

                                {[...cityGroups.entries()].map(([letter, letterCities]) => (
                                    <div key={letter} className="flex flex-col gap-0.5 mb-1">
                                        {letterCities.map((city, index) => (
                                            <CitySelector
                                                key={city.id}
                                                cityName={city.name}
                                                showFirstLetter={index === 0}
                                                displayMode="default"
                                                variant="desktop"
                                                bold={(city.count ?? 0) > 30000}
                                                onClick={() => handleSelectCity(city, selectedRegion.name)}
                                                className="w-full"
                                            />
                                        ))}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

export default CityPickerModal;
