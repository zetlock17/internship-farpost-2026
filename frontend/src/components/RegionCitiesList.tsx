import { memo } from 'react';
import { type GeoNode } from '../stores/cityPicker.data';
import CitySelector from './CitySelector';

interface RegionCitiesListProps {
    regionName: string;
    popularCities: GeoNode[];
    cityGroups: Array<[string, GeoNode[]]>;
    onSelect: (city: GeoNode) => void;
    variant?: 'desktop' | 'mobile';
    selectedCityId?: number | null;
}

export const RegionCitiesList = memo(function RegionCitiesList({
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

            {popularCities.length > 0 && <hr className="border-[#EEE]" />}

            {cityGroups.map(([letter, letterCities]) => (
                <div key={letter} className="flex flex-col gap-0.5 my-5">
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
