import { memo, type ChangeEvent, type RefObject } from 'react';
import searchIconSrc from '../assets/search.svg';
import crossIconSrc from '../assets/cross.svg';

const cn = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(' ');

interface CityPickerHeaderProps {
    query: string;
    inputRef: RefObject<HTMLInputElement | null>;
    onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onClearQuery: () => void;
}

export const CityPickerHeader = memo(function CityPickerHeader({
    query,
    inputRef,
    onQueryChange,
    onClearQuery,
}: CityPickerHeaderProps) {
    return (
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
                    onChange={onQueryChange}
                    placeholder="Название города"
                    className={cn(
                        'w-92 h-9 rounded border border-[#DDD] text-sm text-[#222] placeholder:text-[#999] outline-none focus:border-[#0099FF] py-1.5',
                        query ? 'pl-3 pr-10' : 'pl-8.5 pr-2',
                    )}
                />
                {query && (
                    <button
                        type="button"
                        onClick={onClearQuery}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center"
                        aria-label="Очистить поиск"
                    >
                        <img src={crossIconSrc} aria-hidden="true" alt="" />
                    </button>
                )}
            </div>
        </div>
    );
});
