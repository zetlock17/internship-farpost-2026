import { memo } from 'react';
import { type SearchCity } from '../stores/cityPicker.data';
import CitySelector from './CitySelector';

interface SearchResultsListProps {
    results: SearchCity[];
    onSelect: (city: SearchCity) => void;
    variant?: 'desktop' | 'mobile';
}

export const SearchResultsList = memo(function SearchResultsList({
    results,
    onSelect,
    variant = 'desktop',
}: SearchResultsListProps) {
    if (results.length === 0) {
        return <p className="text-[#999] text-sm mt-4">Города не найдены</p>;
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
