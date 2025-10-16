# 📅 СИСТЕМА РЕЗЕРВАЦИИ - РУКОВОДСТВО ПО ИНТЕГРАЦИИ

## ✅ ЧТО СОЗДАНО (ЭТАПЫ 1-8)

### **Базовая структура:**
- ✅ Типы TypeScript (400+ строк)
- ✅ Firebase сервисы (700+ строк)
- ✅ Логика бронирования (400+ строк)
- ✅ Утилиты (500+ строк)
- ✅ UI компоненты (4500+ строк)

**Всего создано: 24 файла, ~6500+ строк кода**

---

## 📁 СТРУКТУРА СОЗДАННЫХ ФАЙЛОВ

```
src/
├── types/
│   └── booking.ts                          ✅ Все типы для системы
├── firebase/
│   └── bookingServices.ts                  ✅ CRUD операции
├── utils/
│   ├── bookingLogic.ts                     ✅ Логика расчета слотов
│   ├── popularityBadge.ts                  ✅ Бейджи популярности
│   └── icalGenerator.ts                    ✅ Экспорт в календарь
├── components/
│   ├── ServiceForm.tsx                     ✅ Форма услуги
│   ├── ServiceManagement.tsx               ✅ Управление услугами
│   ├── ScheduleBreakManager.tsx            ✅ Управление паузами
│   ├── ScheduleManagement.tsx              ✅ Расписание 90 дней
│   ├── BookingSettingsForm.tsx             ✅ Настройки резервации
│   ├── PopularityBadge.tsx                 ✅ Бейдж популярности
│   ├── BlockTimeModal.tsx                  ✅ Блокировка времени
│   ├── booking/
│   │   ├── TimeSlotGrid.tsx                ✅ Сетка временных слотов
│   │   ├── ServiceSelector.tsx             ✅ Выбор услуги
│   │   ├── MasterBookingModal.tsx          ✅ Резервация у мастера
│   │   ├── SalonBookingModalSimple.tsx     ✅ Резервация в салоне (без мастеров)
│   │   └── SalonBookingModalWithMasters.tsx ✅ Резервация в салоне (с мастерами)
│   └── dashboard/
│       ├── BookingCard.tsx                 ✅ Карточка резервации
│       ├── BookingDetailsModal.tsx         ✅ Детали резервации
│       ├── MasterAnalytics.tsx             ✅ Аналитика мастера
│       ├── SalonAnalytics.tsx              ✅ Аналитика салона
│       └── FavoritesListModal.tsx          ✅ Список избранных
```

---

## 🔌 ИНТЕГРАЦИЯ В ДАШБОРДЫ

### **1. САЛОН (SalonDashboard.tsx)**

Добавить новые вкладки:

```typescript
import { ServiceManagement } from '../components/ServiceManagement';
import { ScheduleManagement } from '../components/ScheduleManagement';
import { BookingSettingsForm } from '../components/BookingSettingsForm';
import { SalonAnalytics } from '../components/dashboard/SalonAnalytics';

// В компоненте SalonDashboard добавить вкладки:

const tabs = [
  { id: 'analytika', name: language === 'cs' ? 'Analytika' : 'Analytics' }, // Переименовать с "Přehled"
  { id: 'profil', name: language === 'cs' ? 'Profil' : 'Profile' },
  { id: 'sluzby', name: language === 'cs' ? 'Naše služby' : 'Our Services' }, // НОВОЕ
  { id: 'rozvrh', name: language === 'cs' ? 'Rozvrh' : 'Schedule' }, // НОВОЕ
  { id: 'rezervace', name: language === 'cs' ? 'Rezervace' : 'Bookings' }, // НОВОЕ
  { id: 'mistri', name: language === 'cs' ? 'Mistři' : 'Masters' },
  { id: 'recenze', name: language === 'cs' ? 'Recenze' : 'Reviews' },
];

// В рендере вкладок:

{activeTab === 'analytika' && (
  <SalonAnalytics 
    salon={salonData} 
    masters={masters}
    language={language} 
  />
)}

{activeTab === 'sluzby' && (
  <ServiceManagement
    providerId={salonId}
    providerType="salon"
    masters={masters}
    language={language}
  />
)}

{activeTab === 'rozvrh' && (
  <ScheduleManagement
    providerId={salonId}
    providerType="salon"
    masters={masters}
    language={language}
  />
)}

{activeTab === 'rezervace' && (
  <>
    <BookingSettingsForm
      providerId={salonId}
      providerType="salon"
      language={language}
    />
    {/* Здесь будет список резерваций */}
  </>
)}
```

### **2. МАСТЕР-ФРИЛАНСЕР (MasterDashboard.tsx)**

Добавить новые вкладки:

```typescript
import { ServiceManagement } from '../components/ServiceManagement';
import { ScheduleManagement } from '../components/ScheduleManagement';
import { BookingSettingsForm } from '../components/BookingSettingsForm';
import { MasterAnalytics } from '../components/dashboard/MasterAnalytics';

const tabs = [
  { id: 'analytika', name: language === 'cs' ? 'Analytika' : 'Analytics' }, // Переименовать с "Přehled"
  { id: 'profil', name: language === 'cs' ? 'Profil' : 'Profile' },
  { id: 'sluzby', name: language === 'cs' ? 'Moje služby' : 'My Services' }, // НОВОЕ
  { id: 'rozvrh', name: language === 'cs' ? 'Rozvrh' : 'Schedule' },
  { id: 'rezervace', name: language === 'cs' ? 'Rezervace' : 'Bookings' }, // НОВОЕ
  { id: 'recenze', name: language === 'cs' ? 'Recenze' : 'Reviews' },
];

{activeTab === 'analytika' && (
  <MasterAnalytics 
    master={masterData} 
    language={language} 
  />
)}

{activeTab === 'sluzby' && (
  <ServiceManagement
    providerId={masterId}
    providerType="master"
    language={language}
  />
)}

{activeTab === 'rozvrh' && (
  <ScheduleManagement
    providerId={masterId}
    providerType="master"
    language={language}
  />
)}

{activeTab === 'rezervace' && (
  <>
    {/* Две секции: "Ke mně" и "Moje rezervace" */}
    <BookingSettingsForm
      providerId={masterId}
      providerType="master"
      language={language}
    />
  </>
)}
```

### **3. КЛИЕНТ (UserDashboard.tsx)**

Добавить вкладку резерваций:

```typescript
const tabs = [
  { id: 'profil', name: language === 'cs' ? 'Profil' : 'Profile' },
  { id: 'rezervace', name: language === 'cs' ? 'Moje rezervace' : 'My Bookings' }, // НОВОЕ
  { id: 'oblibene', name: language === 'cs' ? 'Oblíbené' : 'Favorites' },
];

{activeTab === 'rezervace' && (
  <div>
    {/* Список резерваций клиента */}
  </div>
)}
```

---

## 🔘 ИНТЕГРАЦИЯ КНОПОК REZERVACE

### **В карточках салонов (SalonCard.tsx):**

```typescript
import { SalonBookingModalSimple } from './booking/SalonBookingModalSimple';
import { SalonBookingModalWithMasters } from './booking/SalonBookingModalWithMasters';

// В компоненте:
const [showBookingModal, setShowBookingModal] = useState(false);

// Определить какое модальное окно использовать:
const hasMasters = salon.masters && salon.masters.length > 0;

// Кнопка резервации:
<button onClick={() => setShowBookingModal(true)}>
  Rezervace
</button>

// Модальное окно:
{hasMasters ? (
  <SalonBookingModalWithMasters
    salon={salon}
    masters={salon.masters}
    isOpen={showBookingModal}
    onClose={() => setShowBookingModal(false)}
    onBookingComplete={(id) => {
      console.log('Booking created:', id);
      setShowBookingModal(false);
    }}
    currentUserId={currentUser.id}
    currentUserName={currentUser.name}
    currentUserEmail={currentUser.email}
    currentUserPhone={currentUser.phone}
    language={language}
  />
) : (
  <SalonBookingModalSimple
    salon={salon}
    isOpen={showBookingModal}
    onClose={() => setShowBookingModal(false)}
    onBookingComplete={(id) => {
      console.log('Booking created:', id);
      setShowBookingModal(false);
    }}
    currentUserId={currentUser.id}
    currentUserName={currentUser.name}
    currentUserEmail={currentUser.email}
    currentUserPhone={currentUser.phone}
    language={language}
  />
)}
```

### **В карточках мастеров (MasterCard.tsx):**

```typescript
import { MasterBookingModal } from './booking/MasterBookingModal';

const [showBookingModal, setShowBookingModal] = useState(false);

<button onClick={() => setShowBookingModal(true)}>
  Rezervace
</button>

<MasterBookingModal
  master={master}
  isOpen={showBookingModal}
  onClose={() => setShowBookingModal(false)}
  onBookingComplete={(id) => {
    console.log('Booking created:', id);
    setShowBookingModal(false);
  }}
  currentUserId={currentUser.id}
  currentUserName={currentUser.name}
  currentUserEmail={currentUser.email}
  currentUserPhone={currentUser.phone}
  language={language}
/>
```

---

## 🎨 ДОБАВЛЕНИЕ БЕЙДЖЕЙ ПОПУЛЯРНОСТИ

### **В карточках салонов/мастеров:**

```typescript
import { PopularityBadge } from './PopularityBadge';

// В карточке добавить:
<PopularityBadge 
  favoritesCount={salon.analytics?.favoritesCount || 0}
  language={language}
/>

// Показать счетчик избранного:
<div className="flex items-center gap-2">
  <span>❤️</span>
  <span>{salon.analytics?.favoritesCount || 0} lidí má v oblíbených</span>
</div>
```

---

## 🔧 FIREBASE ПРАВИЛА БЕЗОПАСНОСТИ

Добавить в `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Services
    match /services/{serviceId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        (request.resource.data.providerId == request.auth.uid);
    }
    
    // Schedules
    match /schedules/{scheduleId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        (request.resource.data.providerId == request.auth.uid);
    }
    
    // Bookings
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
        (resource.data.clientId == request.auth.uid || 
         resource.data.providerId == request.auth.uid);
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.clientId == request.auth.uid || 
         resource.data.providerId == request.auth.uid);
    }
    
    // Booking Settings
    match /bookingSettings/{settingsId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && 
        (settingsId == request.auth.uid);
    }
    
    // Blocked Time
    match /blockedTime/{blockedId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
    
    // Booking History
    match /bookingHistory/{historyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Waiting List
    match /waitingList/{entryId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    
    // Favorite History
    match /favoriteHistory/{historyId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.targetId == request.auth.uid);
      allow create: if request.auth != null && 
        (request.resource.data.userId == request.auth.uid);
    }
  }
}
```

---

## ⚠️ ЧТО ОСТАЛОСЬ СДЕЛАТЬ

### **ЭТАП 9: Email уведомления** (Firebase Functions)

Создать Firebase Cloud Functions для:
- Отправки email при создании резервации
- Отправки напоминаний за 24 часа
- Обработки подтверждений по email

### **ЭТАП 10: Автоматизация** (Firebase Functions)

- Автосмена статуса `confirmed → completed`
- Обновление счетчиков аналитики
- Расчет трендов

### **ЭТАП 11: Тестирование**

- Тестирование всех сценариев резервации
- Проверка конфликтов времени
- Проверка пауз и блокировок
- Проверка переводов

### **ЭТАП 12: Функции V2**

- Повторяющиеся резервации
- Лист ожидания
- Статистика для клиента

---

## 🚀 БЫСТРЫЙ СТАРТ

1. **Установить зависимости** (если нужны дополнительные):
```bash
npm install
```

2. **Интегрировать компоненты в дашборды** (см. выше)

3. **Добавить кнопки Rezervace** в карточки

4. **Настроить Firebase правила безопасности**

5. **Тестировать систему**

---

## 📊 ПРОГРЕСС

**Готово: 8 из 12 этапов (67%)**

✅ Этап 1: Типы и Firebase структура  
✅ Этап 2: Управление услугами  
✅ Этап 3: Расписание (90 дней + паузы)  
✅ Этап 4: Настройки резервации  
✅ Этап 5: Логика бронирования  
✅ Этап 6: UI Модальные окна резервации  
✅ Этап 7: Дашборды резерваций  
✅ Этап 8: Аналитика с бейджами  
⏳ Этап 9: Email уведомления  
⏳ Этап 10: Автоматизация  
⏳ Этап 11: Тестирование  
⏳ Этап 12: Функции V2  

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

1. Интегрировать компоненты в существующие дашборды
2. Добавить кнопки резервации в карточки
3. Протестировать основной функционал
4. Настроить Firebase Functions для email
5. Развернуть на production

---

## 💡 СОВЕТЫ

- Все компоненты поддерживают чешский и английский языки
- Модальные окна полностью автономны
- Аналитика использует моковые данные - нужно подключить к реальным
- Email функции требуют настройки SendGrid или аналога
- Все типы полностью типизированы TypeScript

---

Система резервации готова на 67%! 🎉




