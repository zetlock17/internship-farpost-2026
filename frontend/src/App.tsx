import { useEffect, useState } from 'react';
import CityPickerModal, { type SelectedCity } from './components/CityPickerModal';
import { type GeoApiNode, getGeoData } from './api/geoApi';

const COOKIE_KEY = 'cityId';

function getCityIdFromCookie(): number | null {
  const match = document.cookie.split('; ').find((row) => row.startsWith(COOKIE_KEY + '='));
  if (!match) {
    return null;
  }

  const rawValue = decodeURIComponent(match.split('=').slice(1).join('='));
  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function saveCityIdToCookie(cityId: number) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  const value = encodeURIComponent(String(cityId));
  document.cookie = `${COOKIE_KEY}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function findCityById(countries: GeoApiNode[], cityId: number): SelectedCity | null {
  for (const country of countries) {
    for (const district of country.children ?? []) {
      for (const region of district.children ?? []) {
        for (const city of region.children ?? []) {
          if (city.id === cityId) {
            return {
              cityId: city.id,
              cityName: city.name,
              regionName: region.name,
              countryName: country.name,
            };
          }
        }
      }
    }
  }

  return null;
}

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [pickedCity, setPickedCity] = useState<SelectedCity | null>(null);

  useEffect(() => {
    const cityId = getCityIdFromCookie();
    if (cityId === null) {
      return;
    }

    let isCancelled = false;

    getGeoData()
      .then((countries) => {
        if (!isCancelled) {
          setPickedCity(findCityById(countries, cityId));
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to restore city from cookie:', error);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleCitySelect = (city: SelectedCity) => {
    saveCityIdToCookie(city.cityId);
    setPickedCity(city);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">

        <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-center sm:text-left sm:gap-7.75">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-3 py-2 rounded-sm bg-[#FFF2E8] text-[#F66303] text-[16px] font-normal hover:bg-[#FFE4B5] transition-colors gap-1 w-38.5"
          >
            Выбрать город
          </button>
          <span className="text-sm text-[#1E1E1E] text-center sm:text-left">
            {pickedCity
              ? pickedCity.cityName
              : 'Город не выбран'}
          </span>
        </div>

        {modalOpen && (
          <CityPickerModal
            onSelect={handleCitySelect}
            onClose={() => setModalOpen(false)}
            currentCity={pickedCity}
          />
        )}
    </div>
  );
}

export default App;
