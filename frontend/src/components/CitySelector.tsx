import { memo } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import arrowUrl from '../assets/arrow.svg';

export type CitySelectorVariant = 'mobile' | 'desktop' | 'auto';

export interface CitySelectorProps {
    cityName: string;
    showFirstLetter?: boolean;
    selected?: boolean;
    variant?: CitySelectorVariant; // default: 'auto'; auto, mobile, desktop
    onClick?: () => void;
}


const ChevronRight = () => (
    <img src={arrowUrl} width={9} height={14} alt="" aria-hidden="true" />
);


const LetterBadge = memo(({ letter }: { letter: string }) => (
    <span
        className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold shrink-0 select-none"
        aria-hidden="true"
    >
        {letter}
    </span>
));
LetterBadge.displayName = 'LetterBadge';


const CitySelector = memo(function CitySelector({
    cityName,
    showFirstLetter = false,
    selected = false,
    variant = 'auto',
    onClick,
}: CitySelectorProps) {
    const autoIsMobile = useIsMobile();
    const isMobile = variant === 'auto' ? autoIsMobile : variant === 'mobile';

    const firstLetter = cityName.charAt(0);

    const shapeClasses = isMobile
        ? 'rounded-xl px-4 py-3'
        : 'rounded-none px-4 py-3';

    const colourClasses = selected
        ? 'bg-amber-200 text-gray-900'
        : 'bg-white text-blue-700 hover:bg-gray-100';

    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'group flex w-full items-center justify-between gap-2 cursor-pointer',
                'transition-colors duration-150 outline-none',
                shapeClasses,
                colourClasses,
            ].join(' ')}
            aria-pressed={selected}
        >
            <span className="flex items-center gap-2 min-w-0">
                {showFirstLetter && <LetterBadge letter={firstLetter} />}
                <span
                    className={[
                        'truncate text-sm leading-snug',
                        selected ? 'font-semibold' : 'font-medium',
                    ].join(' ')}
                >
                    {cityName}
                </span>
            </span>

            {selected && <ChevronRight />}
        </button>
    );
});

CitySelector.displayName = 'CitySelector';

export default CitySelector;
