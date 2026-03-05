import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import geoData from '../data/geo.json';
import CitySelector from './CitySelector';

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

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5.5" stroke="#999" strokeWidth="1.4" />
        <path d="M11 11l3 3" stroke="#999" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg width="8" height="13" viewBox="0 0 8 13" fill="none" aria-hidden="true">
        <path d="M7 1L1.5 6.5L7 12" stroke="#0052C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="8" height="13" viewBox="0 0 8 13" fill="none" aria-hidden="true">
        <path d="M1 12L6.5 6.5L1 1" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

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
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-100 flex items-center justify-between gap-2',
                active
                    ? 'bg-[#FFEFBA] text-[#4A4A4A] font-medium'
                    : 'text-[#0052C2] hover:bg-[#F4F9FC]',
            )}
        >
            <span>{label}</span>
            {showArrow && <ArrowRightIcon />}
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
        <div className="flex items-center gap-1 text-sm select-none mb-5">
            <button
                type="button"
                onClick={() => setShowCountryPicker((v) => !v)}
                className="flex items-center gap-1 text-[#0052C2] hover:underline"
                aria-label="Выбрать страну"
            >
                <ArrowLeftIcon />
                <span>страны</span>
            </button>
            <span className="text-[#999]">|</span>
            <span className="text-[#4A4A4A] font-medium">{selectedCountry.name}</span>
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
                className="bg-white rounded-2xl shadow-2xl flex flex-col w-240 h-161"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
                    <h2 className="text-xl font-bold text-[#222]">Выбор города</h2>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <SearchIcon />
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Название города"
                            className="pl-9 pr-4 py-2 rounded-lg border border-[#DDD] text-sm text-[#222] placeholder:text-[#999] outline-none focus:border-[#0052C2] w-64"
                        />
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden gap-5">
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
                                                onClick={() => handleSelectCity(city, selectedRegion.name)}
                                                className="w-full"
                                            />
                                        ))}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CityPickerModal;
