import { memo } from 'react';
import { type GeoNode } from '../stores/cityPicker.data';
import CitySelector from './CitySelector';

interface CountryPickerDialogProps {
    primaryCountry: GeoNode;
    secondaryCountries: GeoNode[];
    selectedCountryId: number;
    onClose: () => void;
    onSelectCountry: (countryId: number) => void;
}

export const CountryPickerDialog = memo(function CountryPickerDialog({
    primaryCountry,
    secondaryCountries,
    selectedCountryId,
    onClose,
    onSelectCountry,
}: CountryPickerDialogProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-120 max-h-[80vh] overflow-y-auto scrollbar-hidden p-8"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-[#222] mb-6">Выбор страны</h2>
                <div className="flex flex-col gap-1">
                    <CitySelector
                        cityName={primaryCountry.name}
                        selected={selectedCountryId === primaryCountry.id}
                        variant="desktop"
                        displayMode="default"
                        onClick={() => onSelectCountry(primaryCountry.id)}
                        className="w-full"
                    />
                    {secondaryCountries.map((country) => (
                        <CitySelector
                            key={country.id}
                            cityName={country.name}
                            selected={selectedCountryId === country.id}
                            variant="desktop"
                            displayMode="default"
                            onClick={() => onSelectCountry(country.id)}
                            className="w-full"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});
