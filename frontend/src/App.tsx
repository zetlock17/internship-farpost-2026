import { useState } from 'react';
import CityPickerModal, { type SelectedCity } from './components/CityPickerModal';

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [pickedCity, setPickedCity] = useState<SelectedCity | null>(null);

  const handleCitySelect = (city: SelectedCity) => {
    setPickedCity(city);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">

        <div className="flex items-center gap-7.75">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-3 py-2 rounded-sm bg-[#FFF2E8] text-[#F66303] text-[16px] font-normal hover:bg-[#FFE4B5] transition-colors gap-1 w-38.5"
          >
            Выбрать город
          </button>
          <span className="text-sm text-[#1E1E1E]">
            {pickedCity
              ? `${pickedCity.cityName}, ${pickedCity.regionName}`
              : 'Город не выбран'}
          </span>
        </div>

        {modalOpen && (
          <CityPickerModal
            onSelect={handleCitySelect}
            onClose={() => setModalOpen(false)}
          />
        )}
    </div>
  );
}

export default App;
