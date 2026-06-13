# 🧊 Кто съел мой йогурт? — Интерактивный тест

Интерактивный лендинг с парным тестом для проверки синхронизации между партнёрами в вопросах управления холодильником.

## 🎯 Что это такое?

- Тест из 7 вопросов с таймером
- Возможность пройти вдвоём и сравнить ответы
- Подсчёт процента совпадения
- Красивая карточка результата для шеринга
- Сбор контактов (лидогенерация)
- Интеграция с Google Sheets

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск в режиме разработки

```bash
npm run dev
```

### 3. Сборка для продакшена

```bash
npm run build
```

Готовый сайт будет в папке `dist/`.

---

## 📊 Настройка Google Sheets (сбор лидов)

Чтобы контакты пользователей сохранялись в вашу Google-таблицу, выполните следующие шаги:

### Шаг 1: Создайте Google-таблицу

1. Откройте [Google Sheets](https://sheets.google.com)
2. Создайте новую таблицу
3. В первой строке добавьте заголовки (именно в таком порядке):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Дата | ID сессии | Имя | Email | Telegram | Процент | Уровень | Ответы 1 | Ответы 2 | Источник |

### Шаг 2: Создайте Google Apps Script

1. В таблице нажмите **Расширения → Apps Script**
2. Удалите весь код в редакторе
3. Вставьте этот код:

```javascript
/**
 * Скрипт для приёма данных из веб-формы
 * и записи их в Google-таблицу
 */

function doPost(e) {
  try {
    // Получаем активную таблицу
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Парсим JSON-данные из запроса
    var data = JSON.parse(e.postData.contents);
    
    // Добавляем новую строку с данными
    sheet.appendRow([
      data.timestamp,        // Дата и время
      data.sessionId,        // ID сессии
      data.name,             // Имя
      data.email,            // Email
      data.telegram,         // Telegram
      data.matchPercent,     // Процент совпадения
      data.level,            // Уровень
      data.player1Answers,   // Ответы участника 1
      data.player2Answers,   // Ответы участника 2
      data.utmSource         // Источник трафика
    ]);
    
    // Возвращаем успешный ответ
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // В случае ошибки возвращаем информацию об ошибке
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Тестовая функция для GET-запросов (можно проверить в браузере)
function doGet() {
  return ContentService
    .createTextOutput('Google Sheets API работает! Используйте POST для отправки данных.')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

4. Нажмите **Ctrl+S** (или **Cmd+S** на Mac) чтобы сохранить
5. Назовите проект, например: "FridgeFriend Leads"

### Шаг 3: Опубликуйте скрипт

1. Нажмите **Развернуть → Новое развёртывание**
2. Нажмите на шестерёнку ⚙️ рядом с "Тип" и выберите **Веб-приложение**
3. Заполните настройки:
   - **Описание:** "Сбор лидов FridgeFriend"
   - **Выполнять как:** "Я" (ваш email)
   - **Доступ:** "Все" (это важно!)
4. Нажмите **Развернуть**
5. Нажмите **Предоставить доступ** и разрешите доступ
6. **Скопируйте URL** — он выглядит примерно так:
   ```
   https://script.google.com/macros/s/AKfycbw.../exec
   ```

### Шаг 4: Вставьте URL в код

1. Откройте файл `src/utils/googleSheets.ts`
2. Найдите строку:
   ```typescript
   const GOOGLE_SCRIPT_URL = '';
   ```
3. Вставьте ваш URL:
   ```typescript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw.../exec';
   ```
4. Сохраните файл
5. Пересоберите проект:
   ```bash
   npm run build
   ```

### Готово! 🎉

Теперь при каждой отправке формы данные будут автоматически записываться в вашу Google-таблицу.

---

## 🌐 Публикация сайта

### Вариант 1: Netlify (рекомендуется)

1. Зайдите на [netlify.com](https://netlify.com)
2. Зарегистрируйтесь (бесплатно)
3. Перетащите папку `dist` на страницу Netlify
4. Получите ссылку вида `your-site.netlify.app`

### Вариант 2: GitHub Pages

1. Создайте репозиторий на GitHub
2. Загрузите все файлы проекта
3. Перейдите в **Settings → Pages**
4. Выберите ветку `main` и папку `/ (root)`
5. Сохраните — сайт будет доступен через несколько минут

### Вариант 3: Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Подключите GitHub-репозиторий
3. Vercel автоматически соберёт и опубликует сайт

---

## 📁 Структура проекта

```
├── src/
│   ├── components/          # React-компоненты (экраны)
│   │   ├── HeroScreen.tsx       # Главный экран
│   │   ├── HowItWorksScreen.tsx # "Как это работает"
│   │   ├── InviteScreen.tsx     # Приглашение партнёра
│   │   ├── QuizScreen.tsx       # Тест (вопросы)
│   │   ├── WaitingScreen.tsx    # Ожидание партнёра
│   │   ├── ResultScreen.tsx     # Результат
│   │   ├── ShareScreen.tsx      # Шеринг
│   │   ├── LeadFormScreen.tsx   # Форма контактов
│   │   └── SuccessScreen.tsx    # Успешная отправка
│   │
│   ├── data/
│   │   └── questions.ts     # Вопросы теста и уровни результатов
│   │
│   ├── utils/
│   │   ├── session.ts       # Работа с сессиями (localStorage)
│   │   ├── googleSheets.ts  # Интеграция с Google Sheets
│   │   ├── exportExcel.ts   # Экспорт в Excel
│   │   └── cn.ts            # Утилита для классов
│   │
│   ├── App.tsx              # Главный компонент (навигация)
│   ├── main.tsx             # Точка входа
│   └── index.css            # Стили и анимации
│
├── index.html               # HTML-шаблон
├── package.json             # Зависимости
├── vite.config.ts           # Конфигурация сборки
└── README.md                # Этот файл
```

---

## 🛠 Технологии

- **React 19** — UI-библиотека
- **TypeScript** — типизация
- **Vite** — сборщик
- **Tailwind CSS 4** — стили
- **html-to-image** — генерация PNG-карточек
- **xlsx** — экспорт в Excel
- **Google Apps Script** — интеграция с Google Sheets

---

## ⚠️ Ограничения текущей версии

Данные хранятся в localStorage браузера. Это значит:

| ✅ Работает | ❌ Не работает |
|------------|----------------|
| Тест на одном устройстве | Синхронизация между устройствами |
| Демо-режим (имитация партнёра) | Реальный тест с двух телефонов |
| Сбор контактов в Google Sheets | — |
| Скачивание Excel локально | — |

Для полноценной синхронизации между устройствами нужен бэкенд (Supabase, Firebase и т.д.).

---

## 📝 Лицензия

MIT — используйте свободно!

---

## 🤝 Поддержка

Если есть вопросы — создайте Issue в репозитории.
