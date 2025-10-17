# 🔥 ИНСТРУКЦИЯ ПО НАСТРОЙКЕ FIREBASE ДЛЯ СИСТЕМЫ РЕЗЕРВАЦИИ

## ✅ ГОТОВО К РАЗВЕРТЫВАНИЮ!

**Все компоненты интегрированы!**  
**Осталось только настроить Firebase Functions**

---

## 📋 ШАГ ЗА ШАГОМ

### **ШАГ 1: Установить Firebase CLI (если еще нет)**

```bash
npm install -g firebase-tools
```

Проверить установку:
```bash
firebase --version
```

### **ШАГ 2: Войти в Firebase**

```bash
firebase login
```

### **ШАГ 3: Установить зависимости для Functions**

```bash
cd functions
npm install
cd ..
```

### **ШАГ 4: Настроить Email для отправки уведомлений**

#### **Вариант А: Gmail (для тестирования)**

1. **Создать App Password в Gmail:**
   - Перейти: https://myaccount.google.com/apppasswords
   - Включить двухфакторную аутентификацию (если еще нет)
   - Создать App Password для "Mail"
   - Скопировать сгенерированный пароль (16 символов)

2. **Установить конфигурацию:**

```bash
firebase functions:config:set email.user="ваш-email@gmail.com"
firebase functions:config:set email.password="сгенерированный-app-password"
```

Пример:
```bash
firebase functions:config:set email.user="beautyfind@gmail.com"
firebase functions:config:set email.password="abcd efgh ijkl mnop"
```

#### **Вариант Б: SendGrid (для production)**

1. **Зарегистрироваться на SendGrid:**
   - https://sendgrid.com/
   - Бесплатный план: 100 email/день

2. **Получить API ключ:**
   - Settings → API Keys → Create API Key
   - Скопировать ключ

3. **Установить конфигурацию:**

```bash
firebase functions:config:set sendgrid.apikey="ваш-api-ключ"
firebase functions:config:set sendgrid.from="noreply@beautyfind.cz"
```

4. **Обновить код в `functions/src/index.ts`:**

Заменить Nodemailer на SendGrid:
```typescript
import * as sgMail from '@sendgrid/mail';

sgMail.setApiKey(functions.config().sendgrid.apikey);

// В функциях использовать:
await sgMail.send({
  to: booking.clientEmail,
  from: functions.config().sendgrid.from,
  subject: '...',
  html: '...',
});
```

### **ШАГ 5: Проверить конфигурацию**

```bash
firebase functions:config:get
```

Должно показать:
```json
{
  "email": {
    "user": "ваш-email@gmail.com",
    "password": "your-app-password"
  }
}
```

### **ШАГ 6: Развернуть Firestore Rules**

Создать файл `firestore.rules` в корне проекта (если еще нет):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Salons
    match /salons/{salonId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.ownerId || request.auth.uid == request.resource.data.ownerId);
    }
    
    // Masters
    match /masters/{masterId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.ownerId || request.auth.uid == request.resource.data.ownerId);
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // ============ BOOKING SYSTEM ============
    
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
      allow create, update, delete: if request.auth != null && settingsId == request.auth.uid;
    }
    
    // Email Templates
    match /emailTemplates/{templateId} {
      allow read: if request.auth != null && templateId == request.auth.uid;
      allow create, update: if request.auth != null && templateId == request.auth.uid;
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
      allow create, update, delete: if request.auth != null;
    }
    
    // Favorite History
    match /favoriteHistory/{historyId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.targetId == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

**Развернуть:**
```bash
firebase deploy --only firestore:rules
```

### **ШАГ 7: Развернуть Cloud Functions**

```bash
firebase deploy --only functions
```

Это займет 5-10 минут. Вы увидите:
```
✔  functions: Finished running deploy script.
✔  functions[onBookingCreated(us-central1)]: Successful create operation.
✔  functions[sendBookingReminders(us-central1)]: Successful create operation.
✔  functions[autoCompleteBookings(us-central1)]: Successful create operation.
✔  functions[updateAnalyticsOnBooking(us-central1)]: Successful create operation.
✔  functions[updateAnalyticsOnStatusChange(us-central1)]: Successful create operation.

✔  Deploy complete!
```

### **ШАГ 8: Проверить что Functions работают**

```bash
firebase functions:log
```

Или в Firebase Console:
- Перейти: https://console.firebase.google.com/
- Выбрать проект
- Functions → Logs

---

## 🧪 ТЕСТИРОВАНИЕ

### **1. Тест Email уведомлений:**

```bash
# Вызвать тестовую функцию вручную
firebase functions:shell

# В shell:
onBookingCreated({
  data: {
    clientName: 'Test Client',
    clientEmail: 'test@example.com',
    providerName: 'Test Salon',
    providerEmail: 'salon@example.com',
    serviceName_cs: 'Testovací služba',
    date: '2025-10-20',
    time: '14:00',
    duration: 60,
    price: 500
  }
})
```

### **2. Проверить Cron Jobs:**

В Firebase Console → Functions → вкладка "Logs":
- `sendBookingReminders` - должен запускаться каждый день в 10:00
- `autoCompleteBookings` - должен запускаться каждый час

### **3. Мониторинг:**

```bash
# Просмотр логов в реальном времени
firebase functions:log --only autoCompleteBookings
```

---

## 🔧 ЛОКАЛЬНОЕ ТЕСТИРОВАНИЕ (опционально)

### **Запустить Functions локально:**

```bash
cd functions
npm run serve
```

Откроется эмулятор Functions на http://localhost:5001

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

### **1. Billing:**

Cloud Functions требуют **Blaze Plan** (pay-as-you-go).

**Установить:**
- Firebase Console → ⚙️ Settings → Usage and billing → Modify plan
- Выбрать Blaze Plan

**Стоимость:**
- Бесплатно: 2M invocations/месяц
- Для вашего проекта: вероятно ~$1-5/месяц

### **2. Лимиты Gmail:**

**Gmail App Password:**
- Лимит: ~500 email/день
- Для тестирования: достаточно
- Для production: использовать SendGrid

### **3. Timezone:**

Functions настроены на **Europe/Prague**.

Если нужно изменить:
```typescript
.schedule('0 10 * * *')
.timeZone('Europe/Prague') // ← здесь
```

### **4. Тестирование напоминаний:**

Чтобы не ждать 24 часа, измените в коде:

```typescript
// В sendBookingReminders:
// Вместо:
tomorrow.setDate(tomorrow.getDate() + 1);

// Используйте:
tomorrow.setHours(tomorrow.getHours() + 1); // через 1 час для теста
```

---

## 🎯 ПОЛНЫЙ ПРОЦЕСС РАЗВЕРТЫВАНИЯ

```bash
# 1. Установить зависимости
cd functions
npm install
cd ..

# 2. Настроить email
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"

# 3. Проверить конфигурацию
firebase functions:config:get

# 4. Развернуть всё
firebase deploy --only functions,firestore:rules

# 5. Проверить логи
firebase functions:log

# 6. Готово! 🎉
```

---

## ✅ ЧЕКЛИСТ РАЗВЕРТЫВАНИЯ

- [ ] Firebase CLI установлен
- [ ] Залогинен в Firebase (`firebase login`)
- [ ] Зависимости установлены (`cd functions && npm install`)
- [ ] Email конфигурация установлена
- [ ] Firestore rules развернуты
- [ ] Cloud Functions развернуты
- [ ] Логи проверены (нет ошибок)
- [ ] Тестовый email отправлен успешно
- [ ] Blaze Plan активирован

---

## 🚨 РЕШЕНИЕ ПРОБЛЕМ

### **Ошибка: "Firebase CLI is not installed"**
```bash
npm install -g firebase-tools
```

### **Ошибка: "Billing account not configured"**
- Перейти в Firebase Console
- Settings → Usage and billing
- Upgrade to Blaze Plan

### **Ошибка: "Authentication failed"**
```bash
firebase login --reauth
```

### **Ошибка: "Invalid email credentials"**
- Проверить что используется App Password (не обычный пароль)
- Проверить что 2FA включена в Gmail

### **Email не приходят:**
1. Проверить логи: `firebase functions:log`
2. Проверить spam папку
3. Проверить email конфигурацию: `firebase functions:config:get`

### **Functions не запускаются:**
1. Проверить что Blaze Plan активен
2. Проверить регион: должен быть `us-central1` или `europe-west1`
3. Проверить логи на ошибки

---

## 💡 ПОЛЕЗНЫЕ КОМАНДЫ

```bash
# Просмотр всех Functions
firebase functions:list

# Удалить Function
firebase functions:delete имяФункции

# Просмотр логов конкретной функции
firebase functions:log --only onBookingCreated

# Очистить логи
firebase functions:log --limit 0

# Информация о проекте
firebase projects:list
```

---

## 🎉 ПОСЛЕ РАЗВЕРТЫВАНИЯ

### **Что проверить:**

1. ✅ **Создать услугу** в дашборде салона/мастера
2. ✅ **Установить расписание** на несколько дней
3. ✅ **Сделать тестовую резервацию** 
4. ✅ **Проверить что пришли 2 email:**
   - Клиенту (подтверждение)
   - Провайдеру (новая резервация)
5. ✅ **Проверить дашборд резерваций**
6. ✅ **Проверить аналитику** (счетчики обновились)
7. ✅ **Отменить резервацию** (проверить email отмены)

---

## 📊 МОНИТОРИНГ

### **Firebase Console:**

**Functions → Dashboard:**
- Количество вызовов
- Ошибки
- Время выполнения
- Затраты

**Firestore → Data:**
- Коллекции: services, schedules, bookings
- Проверить что данные создаются

**Authentication → Users:**
- Проверить что пользователи могут регистрироваться

---

## 🔐 БЕЗОПАСНОСТЬ

### **Правила уже настроены:**

✅ Пользователи могут:
- Читать все публичные данные
- Создавать резервации
- Управлять своими данными

✅ Провайдеры могут:
- Управлять своими услугами
- Управлять своим расписанием
- Видеть свои резервации
- Отменять резервации

✅ Клиенты могут:
- Видеть свои резервации
- Отменять свои резервации
- Добавлять в избранное

❌ Нельзя:
- Читать чужие резервации
- Изменять чужие данные
- Удалять чужие услуги

---

## 📧 НАСТРОЙКА ДОМЕНА ДЛЯ EMAIL (опционально)

### **Для профессионального вида:**

Вместо `noreply@beautyfind.cz` использовать свой домен:

1. **Купить домен** (если еще нет)
2. **Настроить DNS записи** для SendGrid/Mailgun
3. **Верифицировать домен** в сервисе email
4. **Обновить** `from` адрес в Functions

---

## 🎊 ВСЁ ГОТОВО!

После выполнения всех шагов система резервации полностью функциональна!

### **Что работает:**
- ✅ Создание резерваций
- ✅ Email уведомления
- ✅ Автоматизация
- ✅ Аналитика
- ✅ Дашборды
- ✅ Все на 2 языках

### **Время развертывания:**
- Настройка email: 5 минут
- Развертывание Functions: 5 минут
- Тестирование: 15 минут
- **Всего: ~25 минут**

---

## 🚀 КОМАНДА БЫСТРОГО СТАРТА

```bash
# Всё в одном скрипте:
cd functions && npm install && cd .. && \
firebase functions:config:set email.user="your-email" && \
firebase functions:config:set email.password="your-password" && \
firebase deploy --only functions,firestore:rules && \
echo "✅ Развертывание завершено!"
```

---

**УСПЕХОВ С ЗАПУСКОМ!** 🎉

После развертывания система резервации BeautyFind полностью готова к работе!






