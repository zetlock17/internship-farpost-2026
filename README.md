# Farpost Internship 2026 by Alexey Krygin

## Что сделано?
- фронт на React
- бэк на FastAPI
- жесты для мобилок
- выбор страны на всех устройствах
- тесты фронта
- стили Tailwind
- стейтменеджер Zustand
- докер

## Пометка
репозиторий велся не по гитфлоу, потому что работал сам, но по привычке за такое стыдно. на названия коммитов в моменте тоже было все равно. короче с гитом могу работать лучше, чем показал в этом репозитории. 
  
## Запуск

### Через Docker

```bash

make docker-up-build # Собрать и запустить все сервисы

make docker-logs # Просмотреть логи

make docker-down # Остановить сервисы

make docker-clean # Очистить всё (удалить volumes)

```

### Запуск не через Docker

**Frontend:**

```bash

cd frontend

npm install

npm run dev # Запуск на http://localhost:5173

```

  
**Backend:**

```bash

cd backend

pip install -r requirements.txt

uvicorn main:app --reload # Запуск на http://localhost:8000

# Документация: http://localhost:8000/docs

```


**Frontend's tests**

``` Тесты
npm run test # Запуск в режиме watch
npm run test:run # Одноразовый прогон
```


### Утилиты

```bash

make free-port-backend # Освободить порт 8000

make free-port-frontend # Освободить порт 5173

make docker-ps # Статус контейнеров

```

---

## Используемый стек
  
### Frontend

- **React**
    
- **TypeScript**
    
- **Vite**
    
- **Tailwind CSS**
    
- **Zustand**
    
- **Axios**
    
- **Vitest**
    
- **@testing-library/react**
    

### Backend

- **FastAPI**
    
- **Python**
    

### Infrastructure

- **Docker**
    
- **Docker Compose**
    
- **Nginx**

---


## Архитектура проекта


```

internship-farpost-2026/

├── frontend/ # React приложение

│ ├── src/

│ │ ├── components/

│ │ │ ├── CityPickerModal.tsx # Модальное окно (desktop)

│ │ │ ├── CityPickerModalMobile.tsx # Модальное окно (mobile)

│ │ │ └── CitySelector.tsx # Переиспользуемая кнопка города

│ │ ├── stores/

│ │ │ ├── cityPicker.store.ts # Zustand состояние

│ │ │ └── cityPicker.data.ts # Производные данные + поиск

│ │ ├── api/

│ │ │ ├── geoApi.ts # Загрузка геоданных

│ │ │ └── api.ts # HTTP утилиты

│ │ ├── hooks/

│ │ │ └── useIsMobile.ts # Обнаружение мобильного устройства

│ │ ├── data/

│ │ │ └── geo.json # Локальная копия геоданных (до появления бэка)

│ │ ├── App.tsx # Главный компонент

│ │ ├── main.tsx # Точка входа

│ │ └── index.css # Глобальные стили

│ ├── vite.config.ts # Vite конфигурация

│ ├── tsconfig.json # TypeScript конфигурация

│ ├── eslint.config.js # ESLint правила

│ ├── package.json # Зависимости

│ └── Dockerfile # Docker фронта

│

├── backend/ # FastAPI приложение

│ ├── app/

│ │ ├── api/

│ │ │ └── routes/

│ │ │ └── geo.py # GET /geo endpoint

│ │ ├── services/

│ │ │ └── geo_service.py # Загрузка geo.json

│ │ ├── core/

│ │ │ └── config.py # Конфигурация

│ │ └── __init__.py

│ ├── main.py # FastAPI приложение

│ ├── geo.json # Иерархия страны → округа → регионы → города

│ ├── requirements.txt # Python зависимости

│ └── Dockerfile # Docker бэка 

│

├── docker-compose.yml # Конфигурация Docker Compose

├── Makefile # Команды для разработки

└── README.md # Этот файл

  

```


---


## Компоненты Frontend


### `CitySelector` — Универсальная кнопка города

  

Переиспользуемый компонент с поддержкой различных режимов отображения и автоматической адаптацией.

  

#### Props:

```typescript

interface CitySelectorProps {

cityName: string; // Название города

regionName?: string; // Название региона (опционально)

showFirstLetter?: boolean; // Показывать букву города слева

selected?: boolean; // Выбран ли элемент

bold?: boolean; // Жирный текст

variant?: 'mobile' | 'desktop' | 'auto'; // Адаптация к устройству

displayMode?: 'default' | 'search-result' | 'all-addons-visible';

onClick?: () => void; // Обработчик клика

className?: string; // CSS классы

}

```

  
#### Display Modes:

  
```
CitySelector — кнопка выбора города.

 Variant (тип устройства):

 - auto (по умолчанию) — определяется через useIsMobile()

 - mobile — всегда мобильный стиль (rounded-lg, меньшая высота)

 - desktop — всегда десктопный стиль (rounded-none, большая высота)


 DisplayMode (режим отображения):

 - default — обычный список городов

 • показывается только название города

 • стрелка появляется если selected=true

 • на desktop левый контейнер с буквой скрывается, если буква не нужна

 • исключение: для элементов 3-го столбца (когда передан regionName)

 контейнер сохраняется пустым, чтобы удерживать одинаковую ширину/выравнивание



 - search-result — результат поиска

 • показывается город + регион

 • стрелка скрыта



 - all-addons-visible — показать все элементы

 • всегда показывается первая буква города

 • показывается город + регион

 • всегда показывается стрелка

```
  

---


### `CityPickerModal` — Модальное окно выбора города (Desktop)

  

Четырёхколонный интерфейс для иерархической навигации.


#### Иерархия:

```

Страны → Федеральные округа → Регионы → Города

```


#### Особенности:

  
✅ **Четырёхколонная иерархия** — выбор идёт слева направо

✅ **Глобальный поиск** — по названию города со всей иерархии

✅ **Транслитерация** — `москва` = `moskva`

✅ **Сброс при выборе страны** — при выборе новой страны сбрасываются округа/регионы/города

✅ **Кеширование** — результаты поиска и геоданные кешируются


---


### `CityPickerModalMobile` — Модальное окно выбора города (Mobile)

  
Пошаговый интерфейс с историей навигации.


#### Навигация:

```

Countries → Districts → Regions → Cities

↑ ↓

(назад) (выбор)

```

  
#### Особенности:


✅ **История навигации** — стек шагов для кнопки "назад"

✅ **Полноэкранные шаги** — каждый уровень на весь экран

✅ **Поиск везде** — доступен на всех уровнях навигации

✅ **Обратная кнопка** — `getPreviousMobileStep()` для навигации

✅ **Состояние в sessionStorage** — сохранение прогресса во время сессии

  
---

### `App.tsx` — Главный компонент


Управление состоянием приложения, модальной окном и сохранением выбора.


#### Функциональность:


```typescript

// Сохранение выбора в cookie (на 1 год)

function saveCityIdToCookie(cityId: number)

  

// Загрузка города из cookie при старте

function getCityIdFromCookie(): number | null

  

// Поиск города в иерархии по ID

function findCityById(countries: GeoApiNode[], cityId: number): SelectedCity | null

```


#### Процесс:


1. При загрузке страницы проверяет cookie

2. Загружает полную иерархию от бэка (если не в кеше)

3. Восстанавливает выбранный город из cookie

4. Показывает модальное окно при клике на кнопку

5. Сохраняет выбор в cookie после выбора города


---


## Управление состоянием (Zustand)

### `cityPicker.store.ts`


```typescript

interface CityPickerStoreState {

query: string; // Текущий поисковый запрос

selectedCountryId: number; // Выбранная страна

selectedDistrictId: number | null; // Выбранный округ

selectedRegionId: number | null; // Выбранный регион

showCountryPicker: boolean; // Открыто ли окно выбора стран

// Actions

setQuery: (query: string) => void;

clearQuery: () => void;

toggleCountryPicker: () => void;

selectCountry: (countryId: number) => void; // Сбрасывает округ, регион

selectDistrict: (districtId: number) => void; // Сбрасывает регион

selectRegion: (regionId: number) => void;

resetState: () => void;

}

```

  
### Логика сброса состояния:

```typescript

selectCountry(id) → {

selectedCountryId = id

selectedDistrictId = null ← сброс

selectedRegionId = null ← сброс

query = '' ← очистка поиска

}

  

selectDistrict(id) → {

selectedDistrictId = id

selectedRegionId = null ← сброс

}

  

selectRegion(id) → {

selectedRegionId = id

// Города выбираются напрямую

}

```

  

Это обеспечивает **консистентность**: нельзя выбрать регион, если не выбран округ.

  

---

  

## Умный поиск (`cityPicker.data.ts`)

### Особенности:

#### 1. **Транслитерация кириллицы**

```typescript

const CYRILLIC_TO_LATIN: Record<string, string> = {

а: 'a', б: 'b', в: 'v', ...

}

  

// Пользователь пишет "москва"

// Система ищет по "moskva" и "москва" одновременно

```

  
#### 2. **Нормализация текста**

- Lowercase преобразование

- Удаление лишних пробелов

- Поддержка substring поиска

  
#### 3. **Глобальный поиск**

- Поиск по названию города независимо от иерархии

- Результаты включают путь: город + регион + страна

- Результаты отсортированы (количество совпадений)

  
#### 4. **Кеширование**


```typescript

interface GeoIndex {

// Кеш полной иерархии

nodesById: Map<number, GeoNode>;

// Кеш результатов поиска по query

searchCache: Map<string, SearchCity[]>;

// Кеш популярных городов и группировки по регионам

regionCache: Map<number, RegionContent>;

// Индекс путей для восстановления выбора

cityPathById: Map<number, { countryId, districtId, regionId }>;

}

```


---


## 🎯 Ключевые решения и подходы

  
### 1. **Разделение логики состояния**

  

- **`cityPicker.store.ts`** — Zustand состояние (query, selection)

- **`cityPicker.data.ts`** — Производные данные (поиск, индексирование, кеширование)

  

**Преимущества**: логика отделена от React, легче тестировать.

  

### 2. **Адаптивный интерфейс без дублирования**

  

Вместо двух разных компонентов для desktop/mobile:

- Один `CitySelector` с вариантами (`variant` prop)

- Два его владельца (`CityPickerModal` и `CityPickerModalMobile`)

  

**Преимущества**: DRY (Don't Repeat Yourself), единая логика оформления.


### 4. **Иерархический сброс состояния**

  

```

selectCountry() → сброс (district, region, query)

selectDistrict() → сброс (region)

selectRegion() → финальный выбор

```


Это обеспечивает, что состояние всегда консистентно.


### 5. **Сохранение выбора через Cookie**
  

```javascript

// Пользователь закрывает браузер...

// Через неделю возвращается

// Его выбор восстановлен из cookie!

saveCityIdToCookie(cityId); // Срок: 1 год

```



## Тестирование

### Frontend тесты:

```bash

cd frontend

  

# Запуск тестов в режиме watch

npm run test

  

# Запуск один раз

npm run test:run

```
  

---

  

## Troubleshooting

  
### Порт уже используется


```bash

# Бэк на 8000

make free-port-backend

  

# Фронт на 5173

make free-port-frontend

```

  
### Docker не работает


```bash

# Очистить всё и пересобрать

make docker-clean

make docker-up-build

```

  

### CORS ошибки

  

Убедитесь, что `VITE_API_URL` в `docker-compose.yml` правильно установлен.

