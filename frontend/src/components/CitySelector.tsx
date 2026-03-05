import { memo } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import arrowUrl from '../assets/arrow.svg';

/**
 * CitySelector — кнопка выбора города.
 *
 * Variant (тип устройства):
 * - auto (по умолчанию) — определяется через useIsMobile()
 * - mobile — всегда мобильный стиль (rounded-lg, меньшая высота)
 * - desktop — всегда десктопный стиль (rounded-none, большая высота)
 *
 * DisplayMode (режим отображения):
 * - default — обычный список городов
 *   • показывается только название города
 *   • стрелка появляется если selected=true
 *
 * - search-result — результат поиска
 *   • показывается город + регион
 *   • стрелка скрыта
 *
 * - all-addons-visible — показать все элементы
 *   • всегда показывается первая буква города
 *   • показывается город + регион
 *   • всегда показывается стрелка
 */

export type CitySelectorVariant = 'mobile' | 'desktop' | 'auto';
export type CitySelectorDisplayMode = 'default' | 'search-result' | 'all-addons-visible';

export interface CitySelectorProps {
    cityName: string;
    regionName?: string;
    showFirstLetter?: boolean;
    selected?: boolean;
    variant?: CitySelectorVariant;
    displayMode?: CitySelectorDisplayMode;
    onClick?: () => void;
    className?: string;
}

const cn = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' ');

const ChevronRight = () => (
    <img src={arrowUrl} width={9} height={14} alt="" aria-hidden="true" />
);

const LetterBadge = memo(({ letter }: { letter: string }) => (
    <div
        className="text-[16px] h-6 w-4 font-normal text-[#999999] text-left"
        aria-hidden="true"
    >
        {letter}
    </div>
));
LetterBadge.displayName = 'LetterBadge';

const CitySelector = memo(function CitySelector({
    cityName,
    regionName,
    showFirstLetter = false,
    selected = false,
    variant = 'auto',
    displayMode = 'default',
    onClick,
    className,
}: CitySelectorProps) {
    const autoIsMobile = useIsMobile();

    const resolvedIsMobile =
        variant === 'auto' ? autoIsMobile : variant === 'mobile';

    const isSearchResult = displayMode === 'search-result';
    const isAllAddonsVisible = displayMode === 'all-addons-visible';

    const firstLetter = cityName.charAt(0);

    const baseShapeClasses = resolvedIsMobile ? 'rounded-lg h-12' : 'rounded-none h-14';

    const searchResultShapeClasses = resolvedIsMobile ? 'rounded-lg h-15.5' : 'rounded-none h-17.5';

    const colourClasses = selected
        ? 'bg-[#FFEFBA] text-[#4A4A4A]'
        : 'bg-white text-[#0052C2] hover:bg-[#F4F9FC]';

    const showLetter = isAllAddonsVisible || showFirstLetter;
    const showArrow = isAllAddonsVisible || (!isSearchResult && selected);

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group flex items-center justify-between gap-3 cursor-pointer text-[16px] font-bold',
                'transition-colors duration-150 outline-none',
                resolvedIsMobile ? 'p-3' : 'px-3 py-4',
                isSearchResult || isAllAddonsVisible ? searchResultShapeClasses : baseShapeClasses,
                colourClasses,
                className,
            )}
            aria-pressed={selected}
        >
            <div className="w-4 h-9.5 self-start -mt-0.5">{showLetter && <LetterBadge letter={firstLetter} />}</div>

            <span className="flex items-center gap-2 min-w-0 flex-1">
                {isSearchResult || isAllAddonsVisible ? (
                    <div className="flex flex-col min-w-0 items-start text-left">
                        <span className="truncate text-sm leading-none">{cityName}</span>

                        {regionName && (
                            <span className="truncate text-xs leading-none mt-1 text-[#999999] font-normal">
                                {regionName}
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="text-sm leading-none relative top-px">
                        {cityName}
                    </span>
                )}
            </span>

            {showArrow && (
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <ChevronRight />
                </div>
            )}
        </button>
    );
});

CitySelector.displayName = 'CitySelector';

export default CitySelector;