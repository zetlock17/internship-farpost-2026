import { memo } from 'react';
import searchBGSrc from '../assets/searchBG.svg';

export const EmptyPickerState = memo(function EmptyPickerState() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <img src={searchBGSrc} width="205" height="194" aria-hidden="true" alt="" />
        </div>
    );
});
