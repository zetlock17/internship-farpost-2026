import { memo } from 'react';
import { type GeoNode } from '../stores/cityPicker.data';
import CitySelector from './CitySelector';

interface SelectionColumnProps {
    items: GeoNode[];
    activeId: number | null;
    onSelect: (itemId: number) => void;
    emptyText?: string;
}

export const SelectionColumn = memo(function SelectionColumn({
    items,
    activeId,
    onSelect,
    emptyText,
}: SelectionColumnProps) {
    if (items.length === 0 && emptyText) {
        return <p className="text-[#999] text-sm px-2">{emptyText}</p>;
    }

    return (
        <>
            {items.map((item) => (
                <CitySelector
                    key={item.id}
                    cityName={item.name}
                    selected={activeId === item.id}
                    variant="desktop"
                    displayMode="default"
                    onClick={() => onSelect(item.id)}
                    className="w-full"
                />
            ))}
        </>
    );
});
