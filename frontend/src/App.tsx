import { useState } from 'react';
import CitySelector from './components/CitySelector';

const CITIES = ['Спасск-Дальний', 'Спасский район', 'Владивосток', 'Находка'];

function App() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-8">
      <div className="flex gap-16">
        <div className="flex flex-col gap-2">
          <p className="text-center font-bold text-sm mb-2 text-gray-700">MOBILE</p>
          {CITIES.map((city) => (
            <CitySelector
              key={city}
              cityName={city}
              showFirstLetter={false}
              selected={selected === city}
              variant="mobile"
              onClick={() => setSelected(city === selected ? null : city)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2 w-72">
          <p className="text-center font-bold text-sm mb-2 text-gray-700">DESKTOP</p>
          {CITIES.map((city) => (
            <CitySelector
              key={city}
              cityName={city}
              showFirstLetter={false}
              selected={selected === city}
              variant="desktop"
              onClick={() => setSelected(city === selected ? null : city)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
