import { memo } from 'react';
import arrowLeftIconSrc from '../assets/arrowCountry.svg';

interface CountryBreadcrumbProps {
    countryName: string;
    onToggleCountryPicker: () => void;
}

export const CountryBreadcrumb = memo(function CountryBreadcrumb({
    countryName,
    onToggleCountryPicker,
}: CountryBreadcrumbProps) {
    return (
        <div className="flex items-center text-sm select-none">
            <button
                type="button"
                onClick={onToggleCountryPicker}
                className="flex items-center justify-end gap-1 text-[#0052C2] hover:underline py-3 pr-3 pl-1 w-24.25"
                aria-label="Выбрать страну"
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    <img src={arrowLeftIconSrc} aria-hidden="true" alt="" />
                </div>
                <span>страны</span>
            </button>
            <span className="text-[#999] w-1.25">|</span>
            <div className="py-3 pl-3 w-24.25">
                <span className="text-[#4A4A4A] font-normal">{countryName}</span>
            </div>
        </div>
    );
});
