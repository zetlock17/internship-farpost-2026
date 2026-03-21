import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { GeoNode } from './stores/cityPicker.data';
import { useCityPickerStore } from './stores/cityPicker.store';

const getGeoDataMock = vi.fn<() => Promise<GeoNode[]>>();
let mobileMode = false;

vi.mock('./api/geoApi', () => ({
    getGeoData: () => getGeoDataMock(),
}));

vi.mock('./hooks/useIsMobile', () => ({
    useIsMobile: () => mobileMode,
}));

const GEO_FIXTURE: GeoNode[] = [
    {
        id: 100,
        name: 'Россия',
        type: 'country',
        children: [
            {
                id: 200,
                name: 'Центральный',
                type: 'federal_district',
                children: [
                    {
                        id: 300,
                        name: 'Московская область',
                        type: 'region',
                        children: [
                            { id: 400, name: 'Москва', type: 'city', count: 100000 },
                            { id: 401, name: 'Мытищи', type: 'city', count: 20000 },
                            { id: 402, name: 'Видное', type: 'city', count: 35000 },
                            { id: 403, name: 'Волоколамск', type: 'city', count: 1000 },
                            { id: 404, name: 'Можайск', type: 'city', count: 50000 },
                        ],
                    },
                    {
                        id: 301,
                        name: 'Тверская область',
                        type: 'region',
                        children: [
                            { id: 405, name: 'Тверь', type: 'city', count: 3000 },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 101,
        name: 'Китай',
        type: 'country',
    },
];

function clearCookies() {
    const cookies = document.cookie.split(';').map((item) => item.trim()).filter(Boolean);

    for (const cookie of cookies) {
        const [name] = cookie.split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    }
}

async function openModal(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: 'Выбрать город' }));
    await screen.findByRole('heading', { name: 'Выбор города' });
}

beforeEach(() => {
    mobileMode = false;
    getGeoDataMock.mockResolvedValue(GEO_FIXTURE);
    useCityPickerStore.getState().resetState();
    clearCookies();
    vi.clearAllMocks();
    getGeoDataMock.mockResolvedValue(GEO_FIXTURE);
});

describe('City picker UI', () => {
    it('shows empty state and allows full desktop selection with cookie save', async () => {
        const user = userEvent.setup();
        render(<App />);

        expect(screen.getByText('Город не выбран')).toBeInTheDocument();

        await openModal(user);

        await user.click(await screen.findByRole('button', { name: 'Центральный' }));
        await user.click(await screen.findByRole('button', { name: 'Московская область' }));
        await user.click(await screen.findByRole('button', { name: 'Москва' }));

        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: 'Выбор города' })).not.toBeInTheDocument();
        });

        expect(screen.getByText('Москва')).toBeInTheDocument();
        expect(document.cookie).toContain('cityId=400');
    });

    it('restores selected city from cookie and pre-highlights path in modal', async () => {
        const user = userEvent.setup();
        document.cookie = 'cityId=401; path=/; SameSite=Lax';

        render(<App />);

        await screen.findByText('Мытищи');
        await openModal(user);

        const selectedDistrict = await screen.findByRole('button', { name: 'Центральный' });
        const selectedRegion = await screen.findByRole('button', { name: 'Московская область' });
        const selectedCity = await screen.findByRole('button', { name: 'Мытищи' });

        expect(selectedDistrict).toHaveAttribute('aria-pressed', 'true');
        expect(selectedRegion).toHaveAttribute('aria-pressed', 'true');
        expect(selectedCity).toHaveAttribute('aria-pressed', 'true');
    });

    it('filters cities by case-insensitive query and selects from search results', async () => {
        const user = userEvent.setup();
        render(<App />);

        await openModal(user);

        const searchInput = screen.getByPlaceholderText('Название города');
        await user.type(searchInput, 'МОС');

        const searchResult = await screen.findByRole('button', { name: /Москва/i });
        expect(searchResult).toBeInTheDocument();

        await user.click(searchResult);

        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: 'Выбор города' })).not.toBeInTheDocument();
        });

        expect(screen.getByText('Москва')).toBeInTheDocument();
    });

    it('marks high-count cities in bold in city column', async () => {
        const user = userEvent.setup();
        render(<App />);

        await openModal(user);

        await user.click(await screen.findByRole('button', { name: 'Центральный' }));
        await user.click(await screen.findByRole('button', { name: 'Московская область' }));

        expect(await screen.findByRole('button', { name: 'Москва' })).toHaveClass('font-bold');
        expect(await screen.findByRole('button', { name: 'Можайск' })).toHaveClass('font-bold');
        expect(await screen.findByRole('button', { name: 'Волоколамск' })).not.toHaveClass('font-bold');
    });

    it('navigates between columns on mobile and supports back button', async () => {
        mobileMode = true;
        const user = userEvent.setup();
        render(<App />);

        await openModal(user);

        await user.click(await screen.findByRole('button', { name: 'Россия' }));
        expect(await screen.findByRole('button', { name: 'Назад' })).toBeInTheDocument();

        await user.click(await screen.findByRole('button', { name: 'Центральный' }));
        expect(await screen.findByRole('button', { name: 'Московская область' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Назад' }));
        expect(await screen.findByRole('button', { name: 'Центральный' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Центральный' }));
        await user.click(await screen.findByRole('button', { name: 'Московская область' }));
        await user.click(await screen.findByRole('button', { name: 'Москва' }));

        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: 'Выбор города' })).not.toBeInTheDocument();
        });

        expect(screen.getByText('Москва')).toBeInTheDocument();
    });
});
