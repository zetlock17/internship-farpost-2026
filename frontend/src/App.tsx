import { useState } from 'react';
import CityPickerModal, { type SelectedCity } from './components/CityPickerModal';

const COOKIE_KEY = 'selected_city';

function getCityFromCookie(): SelectedCity | null {
  const match = document.cookie.split('; ').find((row) => row.startsWith(COOKIE_KEY + '='));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
  } catch {
    return null;
  }
}

function saveCityToCookie(city: SelectedCity) {
  const value = encodeURIComponent(JSON.stringify(city));
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${COOKIE_KEY}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [pickedCity, setPickedCity] = useState<SelectedCity | null>(getCityFromCookie);

  const handleCitySelect = (city: SelectedCity) => {
    saveCityToCookie(city);
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
