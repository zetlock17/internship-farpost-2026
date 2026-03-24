import { useCallback, useEffect, useRef } from 'react';

interface UseMobileBackGestureParams<TStep> {
    currentStep: TStep;
    isSearching: boolean;
    isRootStep: (step: TStep) => boolean;
    onStepBack: (currentStep: TStep) => void;
    onClose: () => void;
    historyStateKey: string;
}

interface UseMobileBackGestureResult {
    syncHistoryEntryBeforeClose: () => void;
    closeWithHistorySync: () => void;
}

export function useMobileBackGesture<TStep>({
    currentStep,
    isSearching,
    isRootStep,
    onStepBack,
    onClose,
    historyStateKey,
}: UseMobileBackGestureParams<TStep>): UseMobileBackGestureResult {
    const hasModalHistoryEntryRef = useRef(false);
    const shouldIgnoreNextPopStateRef = useRef(false);
    const currentStepRef = useRef(currentStep);
    const isSearchingRef = useRef(isSearching);
    const isRootStepRef = useRef(isRootStep);
    const onStepBackRef = useRef(onStepBack);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        currentStepRef.current = currentStep;
    }, [currentStep]);

    useEffect(() => {
        isSearchingRef.current = isSearching;
    }, [isSearching]);

    useEffect(() => {
        isRootStepRef.current = isRootStep;
    }, [isRootStep]);

    useEffect(() => {
        onStepBackRef.current = onStepBack;
    }, [onStepBack]);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    const pushModalHistoryEntry = useCallback(() => {
        window.history.pushState(
            {
                [historyStateKey]: true,
            },
            '',
            window.location.href,
        );

        hasModalHistoryEntryRef.current = true;
    }, [historyStateKey]);

    const syncHistoryEntryBeforeClose = useCallback(() => {
        if (!hasModalHistoryEntryRef.current) {
            return;
        }

        shouldIgnoreNextPopStateRef.current = true;
        hasModalHistoryEntryRef.current = false;
        window.history.back();
    }, []);

    const closeWithHistorySync = useCallback(() => {
        syncHistoryEntryBeforeClose();
        onCloseRef.current();
    }, [syncHistoryEntryBeforeClose]);

    useEffect(() => {
        pushModalHistoryEntry();

        const onPopState = () => {
            if (shouldIgnoreNextPopStateRef.current) {
                shouldIgnoreNextPopStateRef.current = false;
                return;
            }

            const step = currentStepRef.current;
            if (isRootStepRef.current(step) || isSearchingRef.current) {
                hasModalHistoryEntryRef.current = false;
                onCloseRef.current();
                return;
            }

            onStepBackRef.current(step);
            pushModalHistoryEntry();
        };

        window.addEventListener('popstate', onPopState);

        return () => {
            window.removeEventListener('popstate', onPopState);
        };
    }, [pushModalHistoryEntry]);

    return {
        syncHistoryEntryBeforeClose,
        closeWithHistorySync,
    };
}