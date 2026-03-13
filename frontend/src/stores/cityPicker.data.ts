import { useDeferredValue, useMemo } from 'react';
import geoData from '../data/geo.json';

export interface GeoNode {
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

export interface SearchCity extends SelectedCity {
    count: number;
    searchText: string;
    latinSearchText: string;
}

interface RegionContent {
    popularCities: GeoNode[];
    cityGroups: Array<[string, GeoNode[]]>;
}

interface GeoIndex {
    primaryCountry: GeoNode;
    secondaryCountries: GeoNode[];
    nodesById: Map<number, GeoNode>;
    searchableCities: SearchCity[];
    searchCache: Map<string, SearchCity[]>;
    regionCache: Map<number, RegionContent>;
}

interface UseCityPickerDerivedDataArgs {
    query: string;
    selectedCountryId: number;
    selectedDistrictId: number | null;
    selectedRegionId: number | null;
}

interface UseCityPickerDerivedDataResult {
    primaryCountry: GeoNode;
    secondaryCountries: GeoNode[];
    selectedCountry: GeoNode;
    selectedDistrict: GeoNode | null;
    selectedRegion: GeoNode | null;
    districts: GeoNode[];
    regions: GeoNode[];
    searchResults: SearchCity[] | null;
    isSearching: boolean;
    popularCities: GeoNode[];
    cityGroups: Array<[string, GeoNode[]]>;
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'i',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
};

const EMPTY_NODES: GeoNode[] = [];
const EMPTY_CITY_GROUPS: Array<[string, GeoNode[]]> = [];
const EMPTY_REGION_CONTENT: RegionContent = {
    popularCities: EMPTY_NODES,
    cityGroups: EMPTY_CITY_GROUPS,
};

function normalizeSearchValue(value: string): string {
    return value
        .toLocaleLowerCase('ru-RU')
        .replace(/ё/g, 'е')
        .replace(/[^a-zа-я0-9]+/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function transliterateValue(value: string): string {
    return normalizeSearchValue(value)
        .split('')
        .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildSearchText(...parts: string[]): { searchText: string; latinSearchText: string } {
    const combined = parts.filter(Boolean).join(' ');
    return {
        searchText: normalizeSearchValue(combined),
        latinSearchText: transliterateValue(combined),
    };
}

function groupCitiesByLetter(cities: GeoNode[]): Array<[string, GeoNode[]]> {
    const groups = new Map<string, GeoNode[]>();

    for (const city of cities) {
        const letter = city.name.charAt(0).toUpperCase();
        const existingGroup = groups.get(letter);

        if (existingGroup) {
            existingGroup.push(city);
            continue;
        }

        groups.set(letter, [city]);
    }

    return [...groups.entries()];
}

function pickTopCities(cities: GeoNode[], limit = 3): GeoNode[] {
    return [...cities].sort((left, right) => (right.count ?? 0) - (left.count ?? 0)).slice(0, limit);
}

function buildGeoIndex(countries: GeoNode[]): GeoIndex {
    const nodesById = new Map<number, GeoNode>();
    const searchableCities: SearchCity[] = [];

    for (const country of countries) {
        nodesById.set(country.id, country);

        for (const district of country.children ?? []) {
            nodesById.set(district.id, district);

            for (const region of district.children ?? []) {
                nodesById.set(region.id, region);

                for (const city of region.children ?? []) {
                    nodesById.set(city.id, city);

                    searchableCities.push({
                        cityId: city.id,
                        cityName: city.name,
                        regionName: region.name,
                        countryName: country.name,
                        count: city.count ?? 0,
                        ...buildSearchText(city.name, region.name, country.name),
                    });
                }
            }
        }
    }

    const primaryCountry = countries.find((country) => country.name === 'Россия') ?? countries[0];

    return {
        primaryCountry,
        secondaryCountries: countries.filter((country) => country.id !== primaryCountry.id),
        nodesById,
        searchableCities,
        searchCache: new Map<string, SearchCity[]>(),
        regionCache: new Map<number, RegionContent>(),
    };
}

const geoIndex = buildGeoIndex(geoData as GeoNode[]);

export const defaultCountryId = geoIndex.primaryCountry.id;

function getNodeById(nodeId: number | null): GeoNode | null {
    if (nodeId === null) {
        return null;
    }

    return geoIndex.nodesById.get(nodeId) ?? null;
}

function getChildById(parent: GeoNode | null, childId: number | null): GeoNode | null {
    if (!parent || childId === null) {
        return null;
    }

    return (parent.children ?? []).find((child) => child.id === childId) ?? null;
}

function getSearchResults(query: string): SearchCity[] | null {
    const normalizedQuery = normalizeSearchValue(query);
    if (normalizedQuery.length < 2) {
        return null;
    }

    const cachedResults = geoIndex.searchCache.get(normalizedQuery);
    if (cachedResults) {
        return cachedResults;
    }

    const latinQuery = transliterateValue(query);
    const results = geoIndex.searchableCities
        .filter((city) => (
            city.searchText.includes(normalizedQuery)
            || city.latinSearchText.includes(normalizedQuery)
            || city.latinSearchText.includes(latinQuery)
        ))
        .slice(0, 40);

    geoIndex.searchCache.set(normalizedQuery, results);
    return results;
}

function getRegionContent(region: GeoNode | null): RegionContent {
    if (!region) {
        return EMPTY_REGION_CONTENT;
    }

    const cachedContent = geoIndex.regionCache.get(region.id);
    if (cachedContent) {
        return cachedContent;
    }

    const regionCities = region.children ?? EMPTY_NODES;
    const popularCities = pickTopCities(regionCities);
    const popularCityIds = new Set(popularCities.map((city) => city.id));
    const cityGroups = groupCitiesByLetter(
        regionCities.filter((city) => !popularCityIds.has(city.id)),
    );

    const content = { popularCities, cityGroups };
    geoIndex.regionCache.set(region.id, content);
    return content;
}

export function useCityPickerDerivedData({
    query,
    selectedCountryId,
    selectedDistrictId,
    selectedRegionId,
}: UseCityPickerDerivedDataArgs): UseCityPickerDerivedDataResult {
    const deferredQuery = useDeferredValue(query);

    const selectedCountry = useMemo(() => {
        const country = getNodeById(selectedCountryId);
        return country?.type === 'country' ? country : geoIndex.primaryCountry;
    }, [selectedCountryId]);

    const selectedDistrict = useMemo(() => {
        const district = getChildById(selectedCountry, selectedDistrictId);
        return district?.type === 'federal_district' ? district : null;
    }, [selectedCountry, selectedDistrictId]);

    const selectedRegion = useMemo(() => {
        const region = getChildById(selectedDistrict, selectedRegionId);
        return region?.type === 'region' ? region : null;
    }, [selectedDistrict, selectedRegionId]);

    const searchResults = useMemo(() => getSearchResults(deferredQuery), [deferredQuery]);
    const regionContent = useMemo(() => getRegionContent(selectedRegion), [selectedRegion]);

    return {
        primaryCountry: geoIndex.primaryCountry,
        secondaryCountries: geoIndex.secondaryCountries,
        selectedCountry,
        selectedDistrict,
        selectedRegion,
        districts: selectedCountry.children ?? EMPTY_NODES,
        regions: selectedDistrict?.children ?? EMPTY_NODES,
        searchResults,
        isSearching: searchResults !== null,
        popularCities: regionContent.popularCities,
        cityGroups: regionContent.cityGroups,
    };
}